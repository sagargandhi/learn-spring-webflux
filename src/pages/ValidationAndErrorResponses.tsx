import SEO from '../components/SEO';
import PageLayout from '../components/PageLayout';

const PATH = '/validation-and-custom-error-responses-in-spring-webflux';

export default function ValidationAndErrorResponses() {
  return (
    <>
      <SEO
        title="Validation and Custom Error Responses in Spring WebFlux"
        description="Learn how to validate request bodies with Jakarta Bean Validation (@Valid, @NotNull) in Spring WebFlux and return well-structured error responses including RFC 9457 Problem Details format."
        path={PATH}
        keywords="Spring WebFlux validation, @Valid, Bean Validation, custom error response, ProblemDetail, RFC 9457, @ControllerAdvice"
      />
      <PageLayout
        breadcrumb="Building REST APIs"
        title="Validation and Custom Error Responses in Spring WebFlux"
        description="Validate incoming requests with Jakarta Bean Validation and return consistent, machine-readable error responses. This chapter covers constraint annotations, custom validators, global exception handling, and the RFC 9457 Problem Details specification."
        badge={{ text: 'Intermediate', level: 'intermediate' }}
        readTime="21 min read"
        currentPath={PATH}
      >
        <div className="toc">
          <div className="toc-title">On this page</div>
          <ol>
            <li><a href="#dependency">Adding Validation Dependency</a></li>
            <li><a href="#bean-validation">Bean Validation Constraints</a></li>
            <li><a href="#triggering">Triggering Validation with @Valid</a></li>
            <li><a href="#handling-errors">Handling ValidationException</a></li>
            <li><a href="#controller-advice">Global @ControllerAdvice</a></li>
            <li><a href="#custom-validator">Custom Constraint Validators</a></li>
            <li><a href="#problem-details">RFC 9457 Problem Details</a></li>
            <li><a href="#error-response-format">Consistent Error Response Format</a></li>
          </ol>
        </div>

        {/* Dependency */}
        <div className="section" id="dependency">
          <h2 className="section-title">Adding Validation Dependency</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">xml</span>
              <span className="code-block-filename">pom.xml</span>
            </div>
            <pre><code>{`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Transitively provides:
     - jakarta.validation:jakarta.validation-api
     - org.hibernate.validator:hibernate-validator
     - org.glassfish:jakarta.el (EL expression support) -->`}</code></pre>
          </div>
        </div>

        {/* Bean Validation */}
        <div className="section" id="bean-validation">
          <h2 className="section-title">Bean Validation Constraints</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">CreateUserRequest.java — constraints on request DTO</span>
            </div>
            <pre><code>{`package com.example.webfluxdemo.dto;

import jakarta.validation.constraints.*;

public record CreateUserRequest(

    @NotBlank(message = "Username must not be blank")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    String username,

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Must be a valid email address")
    String email,

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Must be at least 18 years old")
    @Max(value = 120, message = "Age cannot exceed 120")
    Integer age,

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9]).{8,}$",
        message = "Password must be at least 8 chars with one uppercase and one digit"
    )
    String password,

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    String bio   // optional field
) {}

// Nested object validation
public record AddressRequest(
    @NotBlank String street,
    @NotBlank String city,
    @NotBlank @Size(min = 2, max = 2) String countryCode
) {}

public record RegisterRequest(
    @Valid @NotNull CreateUserRequest user,
    @Valid @NotNull AddressRequest address
) {}`}</code></pre>
          </div>
        </div>

        {/* Triggering */}
        <div className="section" id="triggering">
          <h2 className="section-title">Triggering Validation with @Valid</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">UserController.java</span>
            </div>
            <pre><code>{`@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public Mono<UserResponse> createUser(
    @RequestBody @Valid CreateUserRequest request) {
    // If validation fails, Spring throws WebExchangeBindException
    // before this method body is executed.
    return userService.create(request);
}

// Programmatic validation (when @Valid isn't enough)
@Autowired
private Validator validator;

@PostMapping("/manual-validate")
public Mono<UserResponse> createUserManual(@RequestBody CreateUserRequest request) {
    Set<ConstraintViolation<CreateUserRequest>> violations = validator.validate(request);
    if (!violations.isEmpty()) {
        String errors = violations.stream()
            .map(v -> v.getPropertyPath() + ": " + v.getMessage())
            .collect(Collectors.joining(", "));
        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, errors));
    }
    return userService.create(request);
}`}</code></pre>
          </div>
          <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div className="info-box-content">
              <div className="info-box-title">WebExchangeBindException</div>
              When <code>@Valid</code> validation fails, Spring WebFlux throws
              <code> WebExchangeBindException</code> (extends <code>MethodArgumentNotValidException</code>).
              It contains a <code>BindingResult</code> with all constraint violations.
            </div>
          </div>
        </div>

        {/* Handling Errors */}
        <div className="section" id="handling-errors">
          <h2 className="section-title">Handling ValidationException</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Extracting validation errors</span>
            </div>
            <pre><code>{`// The violations are in the BindingResult of WebExchangeBindException
WebExchangeBindException ex = ...;

List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();

// Build a map: fieldName → error message
Map<String, String> errors = fieldErrors.stream()
    .collect(Collectors.toMap(
        FieldError::getField,
        FieldError::getDefaultMessage,
        (e1, e2) -> e1   // keep first if same field has multiple violations
    ));

// Example output:
// { "email": "Must be a valid email address", "age": "Must be at least 18 years old" }`}</code></pre>
          </div>
        </div>

        {/* Controller Advice */}
        <div className="section" id="controller-advice">
          <h2 className="section-title">Global @ControllerAdvice</h2>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">GlobalExceptionHandler.java</span>
            </div>
            <pre><code>{`@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle validation errors
    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Mono<Map<String, Object>> handleValidationError(WebExchangeBindException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage,
                (a, b) -> a));

        return Mono.just(Map.of(
            "status", 400,
            "error", "Validation Failed",
            "errors", fieldErrors,
            "timestamp", Instant.now().toString()
        ));
    }

    // Handle resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return Mono.just(Map.of(
            "status", 404,
            "error", "Not Found",
            "message", ex.getMessage(),
            "timestamp", Instant.now().toString()
        ));
    }

    // Handle access denied
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Mono<Map<String, Object>> handleForbidden(AccessDeniedException ex) {
        return Mono.just(Map.of(
            "status", 403,
            "error", "Forbidden",
            "message", "You don't have permission to access this resource",
            "timestamp", Instant.now().toString()
        ));
    }

    // Catch-all handler
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Mono<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return Mono.just(Map.of(
            "status", 500,
            "error", "Internal Server Error",
            "timestamp", Instant.now().toString()
        ));
    }
}`}</code></pre>
          </div>
        </div>

        {/* Custom Validator */}
        <div className="section" id="custom-validator">
          <h2 className="section-title">Custom Constraint Validators</h2>
          <div className="step-content">
            <p>
              Create a custom constraint when the built-in annotations aren't sufficient — for example,
              validating that a username is not already taken (which requires a database lookup).
              Note: custom validators used with <code>@Valid</code> are executed synchronously — for
              async validation, use programmatic validation in the service layer.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Custom @ValidEmail annotation and validator</span>
            </div>
            <pre><code>{`// Step 1: Define the annotation
@Documented
@Constraint(validatedBy = ValidEmailValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmail {
    String message() default "Invalid email address";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String[] blockedDomains() default { "tempmail.com", "mailinator.com" };
}

// Step 2: Implement the ConstraintValidator
public class ValidEmailValidator
        implements ConstraintValidator<ValidEmail, String> {

    private List<String> blockedDomains;

    @Override
    public void initialize(ValidEmail annotation) {
        this.blockedDomains = Arrays.asList(annotation.blockedDomains());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null || value.isBlank()) return true;  // let @NotBlank handle null

        // Basic email format check
        if (!value.contains("@")) return false;

        String domain = value.substring(value.indexOf('@') + 1).toLowerCase();
        return !blockedDomains.contains(domain);
    }
}

// Step 3: Use it
public record CreateUserRequest(
    @NotBlank
    @ValidEmail(blockedDomains = { "tempmail.com", "guerrillamail.com" })
    String email
) {}`}</code></pre>
          </div>
        </div>

        {/* RFC 9457 Problem Details */}
        <div className="section" id="problem-details">
          <h2 className="section-title">RFC 9457 Problem Details</h2>
          <div className="step-content">
            <p>
              Spring 6 (Spring Boot 3) introduced native support for RFC 9457 Problem Details —
              a standardised JSON format for API error responses. Enable it with a single property.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">yaml</span>
              <span className="code-block-filename">application.yml — enable RFC 9457</span>
            </div>
            <pre><code>{`spring:
  webflux:
    problemdetails:
      enabled: true   # Spring will automatically format errors as ProblemDetail`}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">Returning ProblemDetail from @ExceptionHandler</span>
            </div>
            <pre><code>{`@ExceptionHandler(ResourceNotFoundException.class)
public ProblemDetail handleNotFound(ResourceNotFoundException ex, ServerWebExchange exchange) {
    ProblemDetail problem = ProblemDetail
        .forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());

    problem.setTitle("Resource Not Found");
    problem.setType(URI.create("https://api.example.com/errors/not-found"));
    problem.setInstance(URI.create(exchange.getRequest().getPath().value()));
    problem.setProperty("timestamp", Instant.now());

    return problem;
}

// Example response body:
// {
//   "type": "https://api.example.com/errors/not-found",
//   "title": "Resource Not Found",
//   "status": 404,
//   "detail": "User with id 42 was not found",
//   "instance": "/api/users/42",
//   "timestamp": "2025-01-15T12:34:56Z"
// }`}</code></pre>
          </div>
        </div>

        {/* Consistent Format */}
        <div className="section" id="error-response-format">
          <h2 className="section-title">Consistent Error Response Format</h2>
          <div className="step-content">
            <p>
              Define a standard error DTO used across all exception handlers. This ensures every error
              from your API looks the same, making client-side error handling predictable.
            </p>
          </div>
          <div className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">java</span>
              <span className="code-block-filename">ErrorResponse.java — shared error DTO</span>
            </div>
            <pre><code>{`public record ErrorResponse(
    int status,
    String code,
    String message,
    Map<String, String> fieldErrors,
    String path,
    Instant timestamp
) {
    // Factory for single-message errors
    public static ErrorResponse of(int status, String code, String message, String path) {
        return new ErrorResponse(status, code, message, Map.of(), path, Instant.now());
    }

    // Factory for validation errors
    public static ErrorResponse ofValidation(
            Map<String, String> fieldErrors, String path) {
        return new ErrorResponse(
            400, "VALIDATION_FAILED",
            "Request validation failed",
            fieldErrors, path, Instant.now());
    }
}

// Example JSON response:
// {
//   "status": 422,
//   "code": "VALIDATION_FAILED",
//   "message": "Request validation failed",
//   "fieldErrors": {
//     "email": "Must be a valid email address",
//     "age": "Must be at least 18 years old"
//   },
//   "path": "/api/users",
//   "timestamp": "2025-01-15T12:34:56Z"
// }`}</code></pre>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
