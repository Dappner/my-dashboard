import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useUser from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CurrencySelector } from "./components/CurrencySelector";
import type { CurrencyType } from "@my-dashboard/shared";
import { ThemeSwitcher } from "@/components/controls/theme-switcher";

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY"] as const;

const userFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredCurrency: z.enum(currencies).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AccountPage() {
  const { user, updateUser, isLoading: isUserLoading } = useUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      preferredCurrency: user?.preferred_currency,
    },
  });

  async function onSubmit(data: UserFormValues) {
    if (!user) return;

    try {
      // Set theme if it changed
      updateUser({
        id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        preferred_currency: data.preferredCurrency as CurrencyType,
      });
      toast.success("Account information updated");
    } catch (error) {
      console.error("Failed to update user", error);
      toast.error("Failed to update account information");
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center">
        <LoaderCircleIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>
        <ThemeSwitcher />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First Name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Last Name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Currency</FormLabel>
                      <CurrencySelector
                        // biome-ignore lint/style/noNonNullAssertion: THis is always defined
                        value={field.value!}
                        onValueChange={field.onChange}
                      />
                      <FormDescription>
                        This will be used to display all monetary values in the
                        application
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      form.formState.isSubmitting || !form.formState.isDirty
                    }
                    className="w-full sm:w-auto"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Update Information"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
