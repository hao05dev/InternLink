class ProviderUnavailable(RuntimeError):
    """Safe code only: provider exceptions can contain document data."""

    def __init__(self, code: str = "provider_unavailable"):
        self.code = code
        super().__init__(code)
