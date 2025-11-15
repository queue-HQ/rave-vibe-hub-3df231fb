import { useState, useEffect } from "react";

type ValidatorFn = (value: string) => string | null;

interface FieldConfig {
  value: string;
  validators?: ValidatorFn[];
}

type FormFields<T> = {
  [K in keyof T]: FieldConfig;
};

export const useFormValidation = <T extends Record<string, any>>(fields: FormFields<T>) => {
  const [formState, setFormState] = useState(fields);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>)
  );
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = Object.values(formState).every(
      (field) => !field.validators?.some((fn) => fn(field.value))
    );
    setIsValid(valid);
  }, [formState]);

  const handleChange = (name: keyof T, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  };

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const getError = (name: keyof T) => {
    if (!touched[name]) return null;
    const field = formState[name];
    if (!field.validators) return null;
    for (const validator of field.validators) {
      const error = validator(field.value);
      if (error) return error;
    }
    return null;
  };

  const touchAll = () => {
    setTouched((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>));
  };

  return { formState, handleChange, handleBlur, getError, isValid, touchAll };
};
