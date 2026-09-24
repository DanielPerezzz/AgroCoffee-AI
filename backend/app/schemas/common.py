from pydantic import BaseModel, ConfigDict


class AgroCoffeeSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        use_enum_values=True,
    )