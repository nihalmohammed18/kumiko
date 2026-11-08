"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldLabel,
  Form,
  Input,
  toast,
} from "kumiko-ui";
import { useRef, useState } from "react";

/** Edits and removes a local job alert through a task dialog and a confirmation.
 * Use when: trying alert management. Avoid when: subscribing to real email notifications.
 */
export function AlertActions() {
  const [open, setOpen] = useState(false);
  const [alertName, setAlertName] = useState("Frontend jobs");
  const editTrigger = useRef<HTMLButtonElement>(null);
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-title font-bold">Your job alert</h2>
      <p>{alertName ? `Active alert: ${alertName}` : "No alert yet. Create one to watch for new roles."}</p>
      <div className="flex flex-wrap gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger ref={editTrigger}>{alertName ? "Edit job alert" : "Create job alert"}</DialogTrigger>
          <DialogPopup>
            <DialogTitle>Name your job alert</DialogTitle>
            <DialogDescription>Choose a name you will recognise in your inbox.</DialogDescription>
            <DialogBody>
              <Form
                id="job-alert-form"
                onFormSubmit={(values) => {
                  setAlertName(String(values.alertName));
                  setOpen(false);
                  toast.success("Job alert saved");
                }}
              >
                <Field name="alertName">
                  <FieldLabel>Alert name</FieldLabel>
                  <Input defaultValue={alertName} required />
                  <FieldError match="valueMissing">Give your alert a name.</FieldError>
                </Field>
              </Form>
            </DialogBody>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="submit" form="job-alert-form" tone="primary">
                Save alert
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger tone="danger" disabled={!alertName}>
            Delete job alert
          </AlertDialogTrigger>
          <AlertDialogPopup
            cancel="Cancel"
            // Once deleted, its trigger is disabled; return focus to the next useful action.
            finalFocus={() => (alertName ? true : editTrigger.current)}
            actions={
              <AlertDialogClose
                tone="danger"
                onClick={() => {
                  setAlertName("");
                  toast.success("Job alert deleted");
                }}
              >
                Delete alert
              </AlertDialogClose>
            }
          >
            <AlertDialogTitle>Delete this job alert?</AlertDialogTitle>
            <AlertDialogDescription>
              You will stop watching these roles. The saved alert name will be lost.
            </AlertDialogDescription>
          </AlertDialogPopup>
        </AlertDialog>
      </div>
    </section>
  );
}
