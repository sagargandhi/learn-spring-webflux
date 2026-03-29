import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/setting-up-your-first-spring-webflux-project-with-spring-initializr';

export default function SettingUpFirstProject() {
  return (
    <>
      <SEO
        title="Setting Up Your First Spring WebFlux Project with Spring Initializr"
        description="Step-by-step guide to creating a Spring WebFlux project using Spring Initializr, including all required dependencies, Maven/Gradle configuration, and project structure walkthrough."
        path={PATH}
        keywords="Spring Initializr, Spring WebFlux setup, Maven, Gradle, Spring Boot WebFlux project"
      />
      <PageLayout
        breadcrumb="Getting Started"
        title="Setting Up Your First Spring WebFlux Project with Spring Initializr"
        description="A complete, step-by-step walkthrough for bootstrapping a production-ready Spring WebFlux project — from choosing dependencies on start.spring.io to running your first reactive endpoint."
        badge={{ text: 'Beginner', level: 'beginner' }}
        readTime="18 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#prerequisites">Prerequisites</a></li>
            <li><a href="#spring-initializr">Using Spring Initializr</a></li>
            <li><a href="#dependencies">Choosing the Right Dependencies</a></li>
            <li><a href="#pom-xml">Understanding pom.xml / build.gradle</a></li>
            <li><a href="#first-endpoint">Writing Your First Reactive Endpoint</a></li>
            <li><a href="#run-app">Running the Application</a></li>
            <li><a href="#test-endpoint">Testing the Endpoint</a></li>
          </ol>
        </div>

        {/* Prerequisites */}
        <div className="section" id="prerequisites">
          <h2 className="section-title">Prerequisites</h2>
          <div className="step-content">
            <p>Before starting, ensure you have the following tools installed:</p>
            <ul>
              <li><strong>JDK 17 or 21</strong> – Spring Boot 3.x requires JDK 17+. Download from <a href="https://adoptium.net/" target="_blank" rel="noreferrer">Adoptium</a> or use SDKMAN.</li>
              <li><strong>Maven 3.8+</strong> or <strong>Gradle 8+</strong> – build tool. Maven is used in examples below.</li>
              <li><strong>IDE</strong> – IntelliJ IDEA (recommended), VS Code with Java Extension Pack, or Eclipse.</li>
              <li><strong>cURL or HTTPie</strong> – for testing endpoints from the command line.</li>
            </ul>
          </div>
          <div className="info-box tip">
            <span className="info-box-icon">💡</span>
            <div className="info-box-content">
              <div className="info-box-title">Use SDKMAN for easy JDK management</div>
              <code>sdk install java 21-tem</code> installs Eclipse Temurin 21 on macOS/Linux in seconds.
              On Windows, use <a href="https://winget.run/pkg/EclipseAdoptium/Temurin.21.JDK" target="_blank" rel="noreferrer">winget</a> or the Adoptium installer.
            </div>
          </div>
        </div>

        {/* Spring Initializr */}
        <div className="section" id="spring-initializr">
          <h2 className="section-title">Using Spring Initializr</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Open start.spring.io</div>
                <div className="step-content">
                  <p>Navigate to <a href="https://start.spring.io" target="_blank" rel="noreferrer">https://start.spring.io</a> in your browser. This is the official Spring Initializr web UI.</p>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Configure Project Metadata</div>
                <div className="step-content">
                  <p>Fill in the following fields:</p>
                  <ul>
                    <li><strong>Project</strong>: Maven (or Gradle – Kotlin DSL)</li>
                    <li><strong>Language</strong>: Java</li>
                    <li><strong>Spring Boot</strong>: 3.3.x (latest stable)</li>
                    <li><strong>Group</strong>: <code>com.example</code></li>
                    <li><strong>Artifact</strong>: <code>webflux-demo</code></li>
                    <li><strong>Name</strong>: <code>webflux-demo</code></li>
                    <li><strong>Description</strong>: Demo project for Spring WebFlux</li>
                    <li><strong>Package name</strong>: <code>com.example.webfluxdemo</code></li>
                    <li><strong>Packaging</strong>: Jar</li>
                    <li><strong>Java</strong>: 21</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-body">
                <div className="step-title">Add Dependencies</div>
                <div className="step-content">
                  <p>Click <strong>ADD DEPENDENCIES</strong> and search for and add the following:</p>
                </div>
                <table className="dep-table">
                  <thead>
                    <tr>
                      <th>Dependency Name</th>
                      <th>Artifact ID</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="dep-name">Spring Reactive Web</span></td>
                      <td><span className="dep-name">spring-boot-starter-webflux</span></td>
                      <td>Core WebFlux + Netty server</td>
                    </tr>
                    <tr>
                      <td><span className="dep-name">Spring Data R2DBC</span></td>
                      <td><span className="dep-name">spring-boot-starter-data-r2dbc</span></td>
                      <td>Reactive database access</td>
                    </tr>
                    <tr>
                      <td><span className="dep-name">Validation</span></td>
                      <td><span className="dep-name">spring-boot-starter-validation</span></td>
                      <td>Bean Validation (Jakarta)</td>
                    </tr>
                    <tr>
                      <td><span className="dep-name">Lombok</span></td>
                      <td><span className="dep-name">lombok</span></td>
                      <td>Boilerplate reduction</td>
                    </tr>
                    <tr>
                      <td><span className="dep-name">Spring Boot Actuator</span></td>
                      <td><span className="dep-name">spring-boot-starter-actuator</span></td>
                      <td>Health & metrics endpoints</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-body">
                <div className="step-title">Generate and Extract the Project</div>
                <div className="step-content">
                  <p>Click <strong>GENERATE</strong> (or press <kbd>Ctrl+Enter</kbd>). A zip file will download. Extract it to your preferred workspace directory.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* pom.xml */}
        <div className="section" id="pom-xml">
          <h2 className="section-title">Understanding pom.xml</h2>
          <div className="step-content">
            <p>The generated <code>pom.xml</code> will contain the following key blocks. Let's walk through each important section:</p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- ① Spring Boot parent — manages ALL dependency versions for you -->
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.5</version>
    <relativePath/>
  </parent>

  <!-- ② Project coordinates -->
  <groupId>com.example</groupId>
  <artifactId>webflux-demo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>webflux-demo</name>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>

    <!-- ③ Core WebFlux + embedded Netty server -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <!-- ④ Reactive database access via R2DBC -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-r2dbc</artifactId>
    </dependency>

    <!-- ⑤ Bean Validation (Jakarta Validation API) -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- ⑥ Actuator — /actuator/health, /actuator/metrics, etc. -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- ⑦ Lombok — generates getters/setters/builders at compile time -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

    <!-- ⑧ Test slice for reactive apps -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>io.projectreactor</groupId>
      <artifactId>reactor-test</artifactId>
      <scope>test</scope>
    </dependency>

  </dependencies>

  <build>
    <plugins>
      <!-- ⑨ Spring Boot Maven Plugin — builds fat/executable JAR -->
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
          <excludes>
            <exclude>
              <groupId>org.projectlombok</groupId>
              <artifactId>lombok</artifactId>
            </exclude>
          </excludes>
        </configuration>
      </plugin>
    </plugins>
  </build>

</project>`}</code></pre>
          </div>
        </div>

        {/* First Endpoint */}
        <div className="section" id="first-endpoint">
          <h2 className="section-title">Writing Your First Reactive Endpoint</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Create the Main Application Class</div>
                <div className="step-content"><p>This was generated for you by Spring Initializr:</p></div>
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">java</span>
                    <span className="code-block-filename">WebfluxDemoApplication.java</span>
                  </div>
                  <pre><code>{`package com.example.webfluxdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebfluxDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebfluxDemoApplication.class, args);
    }
}`}</code></pre>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Create a Simple Reactive Controller</div>
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">java</span>
                    <span className="code-block-filename">HelloController.java</span>
                  </div>
                  <pre><code>{`package com.example.webfluxdemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
public class HelloController {

    // Returns a single value — Mono
    @GetMapping("/hello")
    public Mono<String> hello(@RequestParam(defaultValue = "World") String name) {
        return Mono.just("Hello, " + name + "! Welcome to Spring WebFlux.");
    }

    // Returns a stream of values — Flux
    // text/event-stream allows the browser to receive items one by one
    @GetMapping(value = "/countdown", produces = "text/event-stream")
    public Flux<String> countdown() {
        return Flux.range(1, 10)
                   .map(i -> "Tick " + i)
                   .delayElements(Duration.ofMillis(500)); // one item every 500ms
    }
}`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Run App */}
        <div className="section" id="run-app">
          <h2 className="section-title">Running the Application</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-body">
                <div className="step-title">Run via Maven</div>
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">bash</span>
                  </div>
                  <pre><code>{`cd webflux-demo
./mvnw spring-boot:run`}</code></pre>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Verify Netty Server Start</div>
                <div className="step-content">
                  <p>You should see in the console:</p>
                </div>
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">text</span>
                  </div>
                  <pre><code>{`Netty started on port 8080 (http)
Started WebfluxDemoApplication in 1.843 seconds`}</code></pre>
                </div>
                <div className="step-content">
                  <p>Notice it says <strong>Netty</strong>, not Tomcat — this confirms WebFlux is active.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test */}
        <div className="section" id="test-endpoint">
          <h2 className="section-title">Testing the Endpoint</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">bash</span>
              <span className="code-block-filename">Terminal</span>
            </div>
            <pre><code>{`# Test the Mono endpoint
curl http://localhost:8080/hello
# → Hello, World! Welcome to Spring WebFlux.

curl "http://localhost:8080/hello?name=Sagar"
# → Hello, Sagar! Welcome to Spring WebFlux.

# Test the streaming Flux endpoint (will stream 10 items over 5 seconds)
curl -N http://localhost:8080/countdown`}</code></pre>
          </div>
          <div className="info-box success">
            <span className="info-box-icon">🎉</span>
            <div className="info-box-content">
              <div className="info-box-title">Congratulations!</div>
              You've created and run your first Spring WebFlux application. Next, let's understand the generated project structure in detail.
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
