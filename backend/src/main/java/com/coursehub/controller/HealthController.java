package com.coursehub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Endpoints for verifying server availability and deployment status")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend service health", description = "Returns operational status and server timestamp")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "CourseHub REST API",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "environment", System.getProperty("spring.profiles.active", "dev")
        ));
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping endpoint", description = "Lightweight ping-pong response for uptime probes")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
