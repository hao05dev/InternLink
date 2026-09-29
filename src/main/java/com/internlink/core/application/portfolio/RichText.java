package com.internlink.core.application.portfolio;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import com.internlink.core.shared.exception.BadRequestException;
import java.util.*;

public final class RichText {
    private RichText() {}
    private static final Safelist ALLOWED = new Safelist()
        .addTags("p","br","strong","b","em","i","u","s","span","h1","h2","h3","h4","ul","ol","li","blockquote","table","thead","tbody","tr","th","td","img","a")
        .addAttributes(":all","style")
        .addAttributes("a","href").addProtocols("a","href","http","https","mailto")
        .addAttributes("img","src","alt","width","height").addProtocols("img","src","data")
        .addAttributes("td","colspan","rowspan").addAttributes("th","colspan","rowspan");
    public static String clean(String html) {
        if (html==null) return "";
        if (html.length()>8_000_000) throw new BadRequestException("Nội dung quá lớn (tối đa 8 MB)");
        Document doc=Jsoup.parseBodyFragment(Jsoup.clean(html,ALLOWED));
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml).escapeMode(org.jsoup.nodes.Entities.EscapeMode.xhtml).prettyPrint(false);
        doc.select("[style]").forEach(el -> {
            List<String> styles=new ArrayList<>();
            for (String part:el.attr("style").split(";")) {
                String[] kv=part.split(":",2);
                if (kv.length!=2) continue;
                String key=kv[0].trim().toLowerCase(), val=kv[1].trim();
                boolean ok=switch(key) {
                    case "text-align" -> val.matches("left|right|center|justify");
                    case "font-family" -> val.replace("\"", "").replace("'", "").matches("Times New Roman|Arial|Calibri");
                    case "font-size" -> val.matches("(1[0-9]|2[0-9]|3[0-6])(pt|px)");
                    case "line-height" -> val.matches("1|1\\.15|1\\.5|2");
                    case "font-weight" -> val.matches("bold|normal|[1-9]00");
                    default -> false;
                };
                if (ok) styles.add(key+":"+val);
            }
            el.attr("style",String.join(";",styles));
        });
        doc.select("img").forEach(el -> {
            String src=el.attr("src");
            if (!src.matches("data:image/(png|jpeg);base64,[A-Za-z0-9+/=]+") || src.length()>2_800_000 || !validImage(src)) el.remove();
            else { el.removeAttr("width");el.removeAttr("height");el.attr("style","max-width:100%;height:auto"); }
        });
        return doc.body().html();
    }
    public static String text(String html) { return Jsoup.parse(html==null?"":html).text(); }
    private static boolean validImage(String src) {
        try(var input=javax.imageio.ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(Base64.getDecoder().decode(src.substring(src.indexOf(',')+1))))) {
            var readers=javax.imageio.ImageIO.getImageReaders(input);if(!readers.hasNext())return false;
            var reader=readers.next();try{reader.setInput(input);long width=reader.getWidth(0),height=reader.getHeight(0);return width>0&&height>0&&width<=10000&&height<=10000&&width*height<=25_000_000;}finally{reader.dispose();}
        }catch(Exception e){return false;}
    }
    public static String escape(Object value) { return org.jsoup.nodes.Entities.escape(value==null?"":String.valueOf(value)); }
}
