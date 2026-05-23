package com.velox.orchestrator.service;

import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.renderer.html.HtmlRenderer;
import org.commonmark.parser.Parser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class KbService {
    private static final Logger logger = LoggerFactory.getLogger(KbService.class);

    @Value("${kb.directory:../knowledge-base}")
    private String kbDirectory;

    private final Parser parser;
    private final HtmlRenderer renderer;

    public KbService() {
        List<org.commonmark.Extension> extensions = Collections.singletonList(TablesExtension.create());
        this.parser = Parser.builder().extensions(extensions).build();
        this.renderer = HtmlRenderer.builder().extensions(extensions).build();
    }

    public static class DocMetadata {
        private String id;
        private String title;
        private String description;
        private String date;
        private String category;
        private List<String> tags;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
    }

    public static class DocData extends DocMetadata {
        private String contentHtml;

        public String getContentHtml() { return contentHtml; }
        public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    }

    public List<DocMetadata> getSortedDocsData() {
        File dir = new File(kbDirectory);
        if (!dir.exists() || !dir.isDirectory()) {
            logger.warn("Knowledge base directory does not exist: {}", kbDirectory);
            return Collections.emptyList();
        }

        File[] files = dir.listFiles((d, name) -> name.endsWith(".md"));
        if (files == null) {
            return Collections.emptyList();
        }

        List<DocMetadata> docs = new ArrayList<>();
        for (File file : files) {
            try {
                String id = file.getName().substring(0, file.getName().length() - 3);
                String content = Files.readString(file.toPath());
                DocMetadata metadata = parseMetadata(id, content);
                docs.add(metadata);
            } catch (IOException e) {
                logger.error("Failed to read knowledge base file: {}", file.getName(), e);
            }
        }
        return docs;
    }

    public Optional<DocData> getDocData(String id) {
        File file = new File(kbDirectory, id + ".md");
        if (!file.exists() || !file.isFile()) {
            return Optional.empty();
        }

        try {
            String fileContents = Files.readString(file.toPath());
            DocMetadata metadata = parseMetadata(id, fileContents);
            
            // Extract body content (everything after the front-matter ending ---)
            String bodyMarkdown = fileContents;
            if (fileContents.startsWith("---")) {
                int secondDash = fileContents.indexOf("---", 3);
                if (secondDash != -1) {
                    bodyMarkdown = fileContents.substring(secondDash + 3).trim();
                }
            }

            // Convert body Markdown to HTML
            org.commonmark.node.Node document = parser.parse(bodyMarkdown);
            String html = renderer.render(document);

            DocData docData = new DocData();
            docData.setId(metadata.getId());
            docData.setTitle(metadata.getTitle());
            docData.setDescription(metadata.getDescription());
            docData.setDate(metadata.getDate());
            docData.setCategory(metadata.getCategory());
            docData.setTags(metadata.getTags());
            docData.setContentHtml(html);

            return Optional.of(docData);
        } catch (IOException e) {
            logger.error("Failed to read knowledge base file: {}.md", id, e);
            return Optional.empty();
        }
    }

    public Optional<Map<String, Object>> matchDoc(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }

        List<DocMetadata> docs = getSortedDocsData();
        String normalizedQuery = query.toLowerCase().trim();

        DocMetadata matchedDoc = null;
        for (DocMetadata doc : docs) {
            // Check tags
            if (doc.getTags() != null) {
                boolean tagMatch = doc.getTags().stream()
                        .anyMatch(tag -> normalizedQuery.contains(tag.toLowerCase()));
                if (tagMatch) {
                    matchedDoc = doc;
                    break;
                }
            }
            // Check Title
            if (doc.getTitle() != null && (doc.getTitle().toLowerCase().contains(normalizedQuery) || normalizedQuery.contains(doc.getTitle().toLowerCase()))) {
                matchedDoc = doc;
                break;
            }

            // Heuristics
            if (normalizedQuery.contains("xss") && "cross-site-scripting-prevention".equals(doc.getId())) {
                matchedDoc = doc;
                break;
            }
            if ((normalizedQuery.contains("sql") || normalizedQuery.contains("injection")) && "sql-injection-prevention".equals(doc.getId())) {
                matchedDoc = doc;
                break;
            }
            if ((normalizedQuery.contains("auth") || normalizedQuery.contains("cookie")) && "secure-authentication".equals(doc.getId())) {
                matchedDoc = doc;
                break;
            }
        }

        if (matchedDoc != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("id", matchedDoc.getId());
            result.put("title", matchedDoc.getTitle());
            result.put("url", "/knowledge-base/" + matchedDoc.getId());
            return Optional.of(result);
        }

        return Optional.empty();
    }

    private DocMetadata parseMetadata(String id, String content) {
        DocMetadata metadata = new DocMetadata();
        metadata.setId(id);
        metadata.setTitle(id); // default fallback

        if (!content.startsWith("---")) {
            return metadata;
        }

        int secondDash = content.indexOf("---", 3);
        if (secondDash == -1) {
            return metadata;
        }

        String frontMatter = content.substring(3, secondDash).trim();
        String[] lines = frontMatter.split("\\r?\\n");

        for (String line : lines) {
            int colonIndex = line.indexOf(':');
            if (colonIndex == -1) continue;

            String key = line.substring(0, colonIndex).trim();
            String val = line.substring(colonIndex + 1).trim();

            // strip enclosing quotes if present
            if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith("\"") && val.endsWith("\""))) {
                val = val.substring(1, val.length() - 1);
            }

            switch (key) {
                case "title":
                    metadata.setTitle(val);
                    break;
                case "description":
                    metadata.setDescription(val);
                    break;
                case "date":
                    metadata.setDate(val);
                    break;
                case "category":
                    metadata.setCategory(val);
                    break;
                case "tags":
                    metadata.setTags(parseTags(val));
                    break;
            }
        }

        return metadata;
    }

    private List<String> parseTags(String rawTags) {
        // e.g., ['sql', 'database', 'injection']
        if (rawTags.startsWith("[") && rawTags.endsWith("]")) {
            rawTags = rawTags.substring(1, rawTags.length() - 1);
        }
        return Arrays.stream(rawTags.split(","))
                .map(String::trim)
                .map(tag -> {
                    if ((tag.startsWith("'") && tag.endsWith("'")) || (tag.startsWith("\"") && tag.endsWith("\""))) {
                        return tag.substring(1, tag.length() - 1);
                    }
                    return tag;
                })
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
    }
}
