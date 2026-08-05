"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, type ProfileValues } from "../validations";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  async function onSubmit(values: ProfileValues) {
    const { error } = await authClient.updateUser({ name: values.name });
    if (error) {
      toast.error(error.message ?? "Couldn't update your profile.");
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-muted-foreground text-xs">
          Contact us to change the email address on your account.
        </p>
      </div>

      <Button
        type="submit"
        variant="brand"
        disabled={isSubmitting || !isDirty}
        className="self-start"
      >
        {isSubmitting ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
