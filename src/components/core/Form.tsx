import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

interface FormProps<T extends FieldValues> {
  methods: UseFormReturn<T, any, T>;
  className?: string
  children?: React.ReactNode;
  onSubmit?: SubmitHandler<T>;
}

function Form<T extends FieldValues>({
  methods,
  className,
  children,
  onSubmit = () => null,
}: FormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form 
        className={className} 
        onSubmit={methods.handleSubmit(onSubmit)}>
          {children}
      </form>
    </FormProvider>
  );
}

export default Form;
