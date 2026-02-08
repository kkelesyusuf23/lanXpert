from typing import Any, Type, Dict, List, TypeVar, Generic
from abc import ABC, abstractmethod

TRequest = TypeVar("TRequest")
TResponse = TypeVar("TResponse")

class IRequest(Generic[TResponse], ABC):
    pass

class IRequestHandler(Generic[TRequest, TResponse], ABC):
    @abstractmethod
    def handle(self, request: TRequest) -> TResponse:
        pass

class Mediator:
    _handlers: Dict[Type[IRequest], Type[IRequestHandler]] = {}

    @classmethod
    def register(cls, request_type: Type[IRequest], handler_type: Type[IRequestHandler]):
        cls._handlers[request_type] = handler_type

    def send(self, request: IRequest[TResponse]) -> TResponse:
        handler_cls = self._handlers.get(type(request))
        if not handler_cls:
            raise ValueError(f"No handler registered for {type(request).__name__}")
        
        handler = handler_cls()
        return handler.handle(request)

# Global mediator instance for simplicity, or use dependency injection
mediator = Mediator()
