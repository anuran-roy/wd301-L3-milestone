import React, { useState, useEffect, useRef } from "react";
import LabelledInput from "./LabelledInput";

interface formFieldType {
  id: number;
  label: string;
  fieldType: string;
  value: string;
}

interface formDataType {
  created_on: string;
  id: number;
  title: string;
  formFields: formFieldType[];
}

const initialformFields: formFieldType[] = [
  { id: 1, label: "First Name", fieldType: "text", value: "" },
  { id: 2, label: "Last Name", fieldType: "text", value: "" },
  { id: 3, label: "Email", fieldType: "email", value: "" },
  { id: 4, label: "Date of Birth", fieldType: "date", value: "" },
];

const getForms: () => formDataType[] = () => {
  let savedFormsJSON = localStorage.getItem("savedForms");
  let persistentForms = savedFormsJSON ? JSON.parse(savedFormsJSON) : [];

  return persistentForms;
};

const initialAutoSaveState: () => boolean = () => {
  let prevAutoSaveState: any = localStorage.getItem("autoSave");
  let persistentAutoSaveState: boolean = prevAutoSaveState
    ? JSON.parse(prevAutoSaveState)
    : false;

  return persistentAutoSaveState;
};

export default function Form(props: { closeFormCB: () => void }) {
  const saveForms = (localForms: formDataType[]) => {
    localStorage.setItem("savedForms", JSON.stringify(localForms));
  };

  const initialFormState: () => formDataType = () => {
    // let formFieldsJSON: any = localStorage.getItem("formState");
    // let persistentFormFields: formFieldType[] = formFieldsJSON ? JSON.parse(formFieldsJSON) : initialformFields;
    const localForms = getForms();

    if (localForms.length > 0) {
      return localForms[0];
    }

    const newForm = {
      created_on: new Date().toString(),
      id: Number(new Date()),
      title: "New Untitled Form",
      formFields: initialformFields,
    };

    saveForms([...localForms, newForm]);
    return newForm;
  };

  const [formState, setFormState] = useState(() => initialFormState());
  const [newField, setNewField] = useState("");
  const [mountedForm, setMountedForm] = useState(-1);

  const [formListState, setFormListState] = useState(getForms());

  const initialListState = (formId: number) => {
    const localForms = getForms();

    setFormState(
      formId === -1
        ? {
            created_on: new Date().toString(),
            id: Number(new Date()),
            title: "New Untitled Form",
            formFields: initialformFields,
          }
        : localForms.filter((form) => form.id === formId)[0]
    );
  };

  const [autoSaveState, setAutoSaveState] = useState(initialAutoSaveState());

  const titleRef = useRef<HTMLInputElement>(null);

  const addForm: () => formDataType = () => {
    const preExistingForms = getForms();
    const newForm: formDataType = {
      created_on: new Date().toString(),
      id: Number(new Date()),
      title: "New Untitled Form",
      formFields: initialformFields,
    };

    saveForms([...preExistingForms, newForm]);
    setFormListState(getForms());

    return newForm;
  };

  const deleteForm: (formId: number) => void = (formId: number) => {
    const storedForms = getForms();

    const updatedForms = storedForms.filter((field) => field.id !== formId);

    saveForms(updatedForms);
    setFormListState(getForms());
  };

  const mountForm = (formId: number, formTitle: string) => {
    setMountedForm(formId);
    initialListState(formId);

    document.title = `Editing: ${formTitle}`
  };

  const saveForm = (currentState: formDataType) => {
    const localForms = getForms();
    const updatedLocalForms = localForms.map((form) => {
      return form.id === currentState.id ? currentState : form;
    });
    saveForms(updatedLocalForms);
    localStorage.setItem("autoSave", JSON.stringify(autoSaveState));
  };

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Form Editor";
    titleRef.current?.focus();
    return () => {
      // cleanup function
      document.title = oldTitle;
    };
  }, []);

  useEffect(() => {
    if (autoSaveState === true) {
      const timeout = setTimeout(() => {
        saveForm(formState);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [formState]);

  const switchAutoSave = () => {
    if (autoSaveState === true) {
      setAutoSaveState(false);
    } else {
      setAutoSaveState(true);
    }
  };
  const addField = () => {
    let field_type: string = "text";
    if (newField.toLowerCase() === "password") {
      field_type = "password";
    }
    if (newField.length === 0) {
      alert("Can't add a field with empty name!");
    } else {
      setFormState({
        ...formState,
        formFields: [
          ...formState.formFields,
          {
            id: Number(new Date()),
            label: newField,
            fieldType: field_type,
            value: "",
          },
        ],
      });

      setNewField("");
    }
  };

  const clearFields = () => {
    setFormState({
      ...formState,
      formFields: formState.formFields.map((field) => {
        return { ...field, value: "" };
      }),
    });
  };

  const removeField = (id: number) => {
    setFormState({
      ...formState,
      formFields: formState.formFields.filter((field) => {
        return field.id !== id;
      }),
    });
  };

  const updateField = (e_value: string, id: number) => {
    setFormState({
      ...formState,
      formFields: formState.formFields.map((field) => {
        if (field.id === id) {
          return {
            ...field,
            value: e_value,
          };
        }

        return field;
      }),
    });
  };

  return (
    <div>
      {mountedForm === -1 ? (
        <>
          <button
            className="my-2 inline-block rounded bg-sky-500 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-sky-600 hover:shadow-lg focus:bg-sky-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-600 active:shadow-lg"
            onClick={addForm}
          >
            New Form
          </button>
          <div className="grid grid-cols-2">
            {formListState.map((form: formDataType) => (
              <div
                key={form.id}
                className="my-2 mx-2 flex flex-1 justify-center"
              >
                <div className="block max-w-sm rounded-lg bg-white p-6 shadow-lg">
                  <h5 className="mb-2 text-xl font-medium leading-tight text-gray-900">
                    {form.title}{" "}
                  </h5>
                  <p className="mb-4 text-base text-gray-700">
                    <strong>Created on:</strong> {form.created_on}
                    <br />
                    <strong>Fields:</strong> {form.formFields.length}
                  </p>
                  <button
                    type="button"
                    className="mx-2 inline-block rounded bg-green-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-green-500 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg"
                    onClick={() => {
                      mountForm(form.id, form.title);
                    }}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="mx-2 inline-block rounded bg-red-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-red-500 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg"
                    onClick={() => {
                      deleteForm(form.id);
                    }}
                  >
                    Delete Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex">
            <label className="my-2 p-2" htmlFor="addFormTitle">
              Form Name:{" "}
            </label>
            <input
              type="text"
              className="my-2 flex-1 rounded-lg border-2 border-gray-200 p-2"
              placeholder="Enter form name..."
              id="addFormTitle"
              ref={titleRef}
              value={formState.title}
              onChange={(e: any) => {
                e.preventDefault();
                // console.log(e.target.value);
                setFormState({
                  ...formState,
                  title: e.target.value,
                });
              }}
            />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {formState.formFields.map((field) => (
              <LabelledInput
                id={field.id}
                key={field.id}
                label={field.label}
                fieldType={field.fieldType}
                removeFieldCB={removeField}
                value={field.value}
                updateFieldCB={updateField}
              />
            ))}

            <button
              type="submit"
              // onClick={document.forms[0].submit()}
              className="btn m-4 rounded-lg bg-sky-500 py-2 px-4 font-bold text-white hover:bg-sky-700"
            >
              Submit
            </button>
            <button
              onClick={props.closeFormCB}
              className="btn m-4 rounded-lg bg-sky-500 py-2 px-4 font-bold text-white hover:bg-sky-700"
            >
              Close Form
            </button>
            <button
              onClick={clearFields}
              className="btn m-4 rounded-lg bg-sky-500 py-2 px-4 font-bold text-white hover:bg-sky-700"
            >
              Clear Form
            </button>
            <button
              onClick={(_) => {
                saveForm(formState);
              }}
              className="btn m-4 rounded-lg bg-sky-500 py-2 px-4 font-bold text-white hover:bg-sky-700"
            >
              Save Form
            </button>
          </form>
          <div className="flex">
            <input
              type="text"
              className="my-2 flex-1 rounded-lg border-2 border-gray-200 p-2"
              placeholder="Enter new field name..."
              id="addFieldInput"
              value={newField}
              onChange={(e: any) => {
                e.preventDefault();
                // console.log(e.target.value);
                setNewField(e.target.value);
              }}
            />
            <button
              onClick={addField}
              className="btn m-4 rounded-lg bg-sky-500 py-2 px-4 font-bold text-white hover:bg-sky-700"
            >
              Add Field
            </button>
            <div className="my-2 flex-1 items-center py-2">
              <label htmlFor="autoSave" className="px-2">
                Autosave?
              </label>
              <input
                type="checkbox"
                name="autosave"
                id="autoSave"
                defaultChecked={autoSaveState}
                onClick={(_) => {
                  switchAutoSave();
                }}
              ></input>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
