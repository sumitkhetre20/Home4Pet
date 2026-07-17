package com.home4pet.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;

public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path dotEnvPath = findDotEnvFile();
        if (dotEnvPath == null) {
            System.out.println("[DotEnv] .env file not found, skipping");
            return;
        }

        System.out.println("[DotEnv] Loading environment from: " + dotEnvPath.toAbsolutePath());
        Map<String, Object> properties = parseDotEnv(dotEnvPath);

        if (!properties.isEmpty()) {
            // addLast = lowest precedence, so real OS env vars always win
            environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
            System.out.println("[DotEnv] Loaded " + properties.size() + " properties");
        }
    }

    private Path findDotEnvFile() {
        Path workingDir = Paths.get("").toAbsolutePath();
        // Check working dir and up to 2 parents (covers running from /backend or project root)
        for (int i = 0; i < 3; i++) {
            Path candidate = workingDir.resolve(".env");
            if (Files.isReadable(candidate)) {
                return candidate;
            }
            Path parent = workingDir.getParent();
            if (parent == null) break;
            workingDir = parent;
        }
        return null;
    }

    private Map<String, Object> parseDotEnv(Path path) {
        Map<String, Object> map = new LinkedHashMap<>();
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.strip();
                if (line.isEmpty() || line.startsWith("#")) continue;

                int idx = line.indexOf('=');
                if (idx < 1) continue;

                String key = line.substring(0, idx).strip();
                String value = line.substring(idx + 1).strip();

                // Strip surrounding quotes
                if (value.length() >= 2 &&
                        ((value.startsWith("\"") && value.endsWith("\"")) ||
                         (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                map.put(key, value);
            }
        } catch (IOException e) {
            System.err.println("[DotEnv] Failed to read .env file: " + e.getMessage());
        }
        return map;
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
