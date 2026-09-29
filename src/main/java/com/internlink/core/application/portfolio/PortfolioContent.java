package com.internlink.core.application.portfolio;

import com.internlink.core.shared.exception.BadRequestException;
import java.math.BigDecimal;
import java.util.*;

public final class PortfolioContent {
    private PortfolioContent() {}
    public static final List<String> SECTION_KEYS=List.of("thanks","organization","work","method","outcomes");
    public static final List<String> SECTION_TITLES=List.of("LỜI CẢM ƠN","CHƯƠNG I. TÌM HIỂU VỀ CƠ QUAN NƠI THỰC TẬP","CHƯƠNG II. NỘI DUNG CÔNG VIỆC","CHƯƠNG III. PHƯƠNG PHÁP THỰC HIỆN","CHƯƠNG IV. KẾT QUẢ ĐẠT ĐƯỢC");
    public static final List<String> CRITERIA=List.of("I.1. Thực hiện nội quy của cơ quan","I.2. Chấp hành giờ giấc làm việc","I.3. Thái độ giao tiếp với cán bộ trong đơn vị","I.4. Tích cực trong công việc","II.1. Đáp ứng yêu cầu công việc","II.2. Tinh thần học hỏi, nâng cao trình độ chuyên môn, nghiệp vụ","II.3. Có đề xuất, sáng kiến, năng động trong công việc","III.1. Báo cáo tiến độ công việc cho cán bộ hướng dẫn mỗi tuần một lần","III.2. Hoàn thành công việc được giao","III.3. Kết quả công việc có đóng góp cho cơ quan nơi thực tập");
    public static final List<String> TRAINING=List.of("Phù hợp với thực tế","Không phù hợp với thực tế","Tăng cường kỹ năng mềm","Tăng cường ngoại ngữ","Tăng cường kỹ năng làm việc nhóm");
    public static Map<String,Object> clean(String kind,Map<String,Object> raw,int weekCount) {
        if (raw==null) raw=Map.of();
        Map<String,Object> out=new LinkedHashMap<>();
        if (Set.of("M01","M02").contains(kind)) {
            Map<Integer,Map<String,Object>> byWeek=new HashMap<>();
            for(Map<String,Object> row:rows(raw)) {
                int week;
                try { week=number(row.get("week")).intValueExact(); }
                catch(ArithmeticException e) { throw new BadRequestException("Số tuần phải là số nguyên hợp lệ"); }
                if(week<1||week>weekCount||byWeek.containsKey(week)) throw new BadRequestException("Tuần bị trùng hoặc ngoài kỳ thực tập");
                Map<String,Object> v=new LinkedHashMap<>(); v.put("week",week);
                v.put("tasks",RichText.clean(string(row,"tasks"))); v.put("comment",RichText.clean(string(row,"comment")));
                BigDecimal sessions=number(row.get("sessions")),hours=number(row.get("hours"));
                if(sessions.signum()<0||sessions.compareTo(BigDecimal.valueOf(14))>0||sessions.stripTrailingZeros().scale()>0||hours.signum()<0||hours.compareTo(BigDecimal.valueOf(168))>0)
                    throw new BadRequestException("Số buổi/giờ không hợp lệ");
                v.put("sessions",sessions);v.put("hours",hours);byWeek.put(week,v);
            }
            out.put("weeks",byWeek.entrySet().stream().sorted(Map.Entry.comparingByKey()).map(Map.Entry::getValue).toList());
        }
        if("M05".equals(kind)) {
            Map<String,Object> sections=map(raw.get("sections")); Map<String,Object> clean=new LinkedHashMap<>();
            for(String key:SECTION_KEYS) clean.put(key,RichText.clean(string(sections,key)));
            out.put("sections",clean);
            String paper=string(raw,"paperSize");out.put("paperSize","A4".equals(paper)?"A4":"LETTER");
            out.put("courseName",limit(string(raw,"courseName"),200));
        }
        if(Set.of("M03","M04").contains(kind)) {
            Map<String,Object> academic=new LinkedHashMap<>();
            if(map(raw.get("academicScores")).size()>50)throw new BadRequestException("Quá nhiều thành phần điểm");
            map(raw.get("academicScores")).forEach((key,value)->{
                if(!key.matches("[A-Za-z0-9_.-]{1,50}"))throw new BadRequestException("Mã thành phần không hợp lệ");
                var part=map(value);var cleaned=new LinkedHashMap<String,Object>();
                if(part.get("score")!=null&&!"".equals(part.get("score")))cleaned.put("score",score(part.get("score")));
                var criteria=new LinkedHashMap<String,Object>();
                if(map(part.get("criteriaScores")).size()>100)throw new BadRequestException("Quá nhiều tiêu chí");
                map(part.get("criteriaScores")).forEach((code,v)->{if(v!=null&&!"".equals(v))criteria.put(code,score(v));});
                cleaned.put("criteriaScores",criteria);academic.put(key,cleaned);
            });
            out.put("academicScores",academic);
            Map<String,Object> scores=map(raw.get("scores"));Map<String,Object> clean=new LinkedHashMap<>();
            boolean remote=Boolean.TRUE.equals(raw.get("remote"));
            for(var entry:scores.entrySet()) {
                if(entry.getValue()==null||"".equals(entry.getValue())) continue;
                if(!entry.getKey().matches("[A-Za-z0-9_.-]{1,50}")) throw new BadRequestException("Mã tiêu chí không hợp lệ");
                BigDecimal value=number(entry.getValue());
                if(value.signum()<0||value.compareTo(BigDecimal.TEN)>0) throw new BadRequestException("Điểm phải trong thang 0–10");
                if("M03".equals(kind)) {
                    int index;
                    try { index=Integer.parseInt(entry.getKey()); } catch(Exception e) { throw new BadRequestException("Mã tiêu chí M-TT-03 không hợp lệ"); }
                    if(index<0||index>=10) throw new BadRequestException("Mã tiêu chí M-TT-03 không hợp lệ");
                    if(remote&&index<3) continue;
                    if(value.compareTo(BigDecimal.ONE)<0) throw new BadRequestException("M-TT-03 chấm từ 1 đến 10; mục không áp dụng được bỏ qua");
                }
                clean.put(entry.getKey(),value);
            }
            out.put("scores",clean);out.put("remote",remote);
            out.put("comment",RichText.clean(string(raw,"comment")));
            out.put("suggestions",RichText.clean(string(raw,"suggestions")));
            Object feedback=raw.get("trainingFeedback");
            out.put("trainingFeedback",feedback instanceof List<?> list?list.stream().map(String::valueOf).filter(TRAINING::contains).distinct().toList():List.of());
        }
        out.put("place",limit(string(raw,"place"),100));
        return canonical(out);
    }
    public static void validateComplete(String kind,Map<String,Object> content,int weeks) {
        if("M01".equals(kind)||"M02".equals(kind)) {
            var rows=rows(content);
            if(rows.size()!=weeks) throw new BadRequestException("Cần hoàn thành đủ "+weeks+" tuần");
            for(var row:rows) if(RichText.text(string(row,"tasks")).isBlank() || ("M02".equals(kind)&&RichText.text(string(row,"comment")).isBlank()))
                throw new BadRequestException("Cần nhập công việc và nhận xét của từng tuần");
        }
        if("M03".equals(kind)) {
            var scores=map(content.get("scores")); int start=Boolean.TRUE.equals(content.get("remote"))?3:0;
            for(int i=start;i<10;i++) if(!scores.containsKey(String.valueOf(i))) throw new BadRequestException("Cần chấm đủ các tiêu chí áp dụng");
            if(RichText.text(string(content,"comment")).isBlank()) throw new BadRequestException("Cần có nhận xét của cán bộ hướng dẫn");
        }
        if("M05".equals(kind)) for(String key:SECTION_KEYS) if(RichText.text(string(map(content.get("sections")),key)).isBlank()) throw new BadRequestException("Báo cáo còn mục chưa có nội dung");
    }
    @SuppressWarnings("unchecked") public static Map<String,Object> map(Object value) { return value instanceof Map<?,?> m?(Map<String,Object>)m:Map.of(); }
    public static List<Map<String,Object>> rows(Map<String,Object> value) { return value.get("weeks") instanceof List<?> list?list.stream().map(PortfolioContent::map).toList():List.of(); }
    public static String string(Map<String,Object> map,String key) { Object v=map.get(key);return v instanceof String s?s:""; }
    public static BigDecimal number(Object value) { try{return value==null?BigDecimal.ZERO:new BigDecimal(value.toString());}catch(Exception e){throw new BadRequestException("Giá trị số không hợp lệ");} }
    private static String limit(String s,int n){if(s.length()>n)throw new BadRequestException("Nội dung vượt quá "+n+" ký tự");return s;}
    private static BigDecimal score(Object value){return com.internlink.core.application.evaluation.AssessmentRules.score10(number(value));}
    /** Match JSONB's numeric types so Hibernate dirty checking does not increment versions on every flush. */
    public static Map<String,Object> canonical(Map<String,Object> content) {
        try {var mapper=new com.fasterxml.jackson.databind.ObjectMapper();return mapper.readValue(mapper.writeValueAsBytes(content),new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>(){});}
        catch(java.io.IOException e){throw new BadRequestException("Nội dung biểu mẫu không hợp lệ");}
    }
}
