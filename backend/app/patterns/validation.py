from typing import Any, Callable, List, TypeVar, Generic, Dict

T = TypeVar("T")

class ValidationFailure:
    def __init__(self, property_name: str, error_message: str):
        self.property_name = property_name
        self.error_message = error_message

    def __repr__(self):
        return f"{self.property_name}: {self.error_message}"

class Rule(Generic[T]):
    def __init__(self, selector: Callable[[T], Any], property_name: str):
        self.selector = selector
        self.property_name = property_name
        self.validators: List[Callable[[Any], str | None]] = []
        self.message: str = "Invalid value"

    def not_empty(self):
        def validate(val):
            if val is None or val == "" or (isinstance(val, list) and len(val) == 0):
                return "must not be empty"
            return None
        self.validators.append(validate)
        return self

    def minimum_length(self, length: int):
        def validate(val):
            if val and len(str(val)) < length:
                return f"must be at least {length} characters long"
            return None
        self.validators.append(validate)
        return self

    def maximum_length(self, length: int):
        def validate(val):
            if val and len(str(val)) > length:
                return f"must be at most {length} characters long"
            return None
        self.validators.append(validate)
        return self
    
    def match(self, pattern: str):
        import re
        def validate(val):
            if val and not re.match(pattern, str(val)):
                return "format is invalid"
            return None
        self.validators.append(validate)
        return self
        
    def email_address(self):
        import re
        # Simple regex for email
        pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        return self.match(pattern).with_message("is not a valid email address")

    def with_message(self, message: str):
        # Override the last validator's default message or set a general one?
        # For simplicity, let's just use it as a custom suffix or replacement strategy
        # A true FluentValidation allows per-rule customization more deeply.
        # Here we attach it to the Rule object to use if validation fails.
        self.message = message
        return self

class AbstractValidator(Generic[T]):
    def __init__(self):
        self.rules: List[Rule] = []

    def rule_for(self, selector: Callable[[T], Any], property_name: str = None) -> Rule:
        # Attempt to infer property name if not provided (advanced, skip for basic)
        # Using a manual property name for clarity in this implementation
        if property_name is None:
            property_name = "Field"
        rule = Rule(selector, property_name)
        self.rules.append(rule)
        return rule

    def validate(self, instance: T) -> List[ValidationFailure]:
        failures = []
        for rule in self.rules:
            value = rule.selector(instance)
            for validator in rule.validators:
                error = validator(value)
                if error:
                    msg = rule.message if rule.message != "Invalid value" else error
                    failures.append(ValidationFailure(rule.property_name, msg))
                    # Stop processing validators for this rule on first failure? usually yes.
                    break 
        return failures

class ValidationException(Exception):
    def __init__(self, errors: List[ValidationFailure]):
        self.errors = errors
