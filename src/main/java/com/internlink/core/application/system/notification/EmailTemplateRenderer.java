package com.internlink.core.application.system.notification;

import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.*;

@Component
public class EmailTemplateRenderer {
    private static final Pattern VARIABLE = Pattern.compile("\\{\\{([a-zA-Z][a-zA-Z0-9.]*)}}" );

    public List<String> variables(String subject, String body) {
        var result = new LinkedHashSet<String>();
        collect(subject, result);
        collect(body, result);
        return List.copyOf(result);
    }

    public String render(String template, Map<String, String> values) {
        if (template == null) throw new BadRequestException("Template email không hợp lệ");
        Matcher matcher = VARIABLE.matcher(template);
        StringBuffer output = new StringBuffer();
        while (matcher.find()) {
            String key = matcher.group(1);
            if (!values.containsKey(key))
                throw new BadRequestException("Thiếu dữ liệu cho biến {{" + key + "}}");
            matcher.appendReplacement(output, Matcher.quoteReplacement(Objects.toString(values.get(key), "")));
        }
        matcher.appendTail(output);
        if (output.length() > 50000) throw new BadRequestException("Nội dung email vượt quá 50.000 ký tự");
        return output.toString();
    }

    private void collect(String value, Set<String> result) {
        if (value == null) return;
        Matcher matcher = VARIABLE.matcher(value);
        while (matcher.find()) result.add(matcher.group(1));
    }
}
