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

const CurrentStashId = "1234";

const CreateShelfForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      name: "",
      order: "",
      capacity: 0,
      temp: 0.0,
      stashId: "",
    },
    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    // },
  });

  // console.log("queryId: ", Router.query.id);
  const submitData = async (e: React.SyntheticEvent) => {
    console.log("submitData function");

    e.preventDefault();

    try {
      console.log("form.values: ", form.values);
      const body = {
        name: form.values.name,
        order: form.values.order,
        capacity: form.values.capacity,
        temp: form.values.temp,
        stashId: "1234",
      };
      console.log("body: ", body);
      await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // need to return back to right fridge page
      //   await Router.push("/shelves");
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

export default CreateShelfForm;
