import React, { useState } from "react";
import Router from "next/router";
import {
  Container,
  Button,
  Input,
  Textarea,
  Box,
  TextInput,
  NumberInput,
  Checkbox,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Stash } from "@prisma/client";

const CreateStashForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      name: "",
      location: "",
      type: "fridge",
    },
    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    // },
  });

  const submitData = async (e: React.SyntheticEvent) => {
    console.log("submitData function");

    e.preventDefault();

    try {
      console.log("form.values: ", form.values);
      const body = {
        name: form.values.name,
        location: form.values.location,
        type: form.values.type,
      };
      console.log("body: ", body);
      await fetch("/api/stashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      await Router.push("/stashes");
      console.log("submitData function");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <h1>Create Stash</h1>
      <Box maw={340} mx="auto">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Red Wine Fridge"
            {...form.getInputProps("name")}
          />
          <TextInput
            withAsterisk
            label="Location"
            placeholder="Kitchen"
            {...form.getInputProps("location")}
          />
          <TextInput
            withAsterisk
            label="type"
            placeholder="fridge"
            {...form.getInputProps("type")}
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" onClick={submitData}>
              Submit
            </Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
};

export default CreateStashForm;
