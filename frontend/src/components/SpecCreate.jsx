import * as React from "react";
import { useNavigate } from "react-router";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  createOne as createSpec,
  validate as validateSpec,
} from "../data/specs";
import SpecForm from "./SpecForm";
import PageContainer from "./PageContainer";

const INITIAL_FORM_VALUES = {
  code: "",
  desc: "",
  supplier: "",
  category: "",
  image: "",
  comment: "",
  revisedOn: null,
};

export default function SpecCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (code, value) => {
      const validateField = async (values) => {
        const { issues } = validateSpec(values);
        setFormErrors({
          ...formErrors,
          [code]: issues?.find((issue) => issue.path?.[0] === code)?.message,
        });
      };

      const newFormValues = { ...formValues, [code]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateSpec(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(
          issues.map((issue) => [issue.path?.[0], issue.message]),
        ),
      );
      return;
    }
    setFormErrors({});

    try {
      await createSpec(formValues);
      notifications.show("Spec created successfully.", {
        severity: "success",
        autoHideDuration: 3000,
      });

      navigate("/dashboard/specs");
    } catch (createError) {
      notifications.show(
        `Failed to create Spec. Reason: ${createError.message}`,
        {
          severity: "error",
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="New Spec"
      breadcrumbs={[{ title: "specs", path: "/dashboard/specs" }, { title: "New" }]}
    >
      <SpecForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
        backButtonPath="/dashboard/specs"
      />
    </PageContainer>
  );
}
