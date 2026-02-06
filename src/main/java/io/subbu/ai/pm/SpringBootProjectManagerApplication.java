package io.subbu.ai.pm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class SpringBootProjectManagerApplication {

    public static void main(String[] args) {
        // Set default timezone to UTC to avoid timezone issues with PostgreSQL
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(SpringBootProjectManagerApplication.class, args);
    }

}
