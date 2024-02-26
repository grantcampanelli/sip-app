import React, { useState } from "react";
// import Layout from "../components/Layout";
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

const submitData = async (e: React.SyntheticEvent) => {
  e.preventDefault();
  try {
    // const body = { title, content };
    // const body = "title, content";
    // await fetch("/api/post", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(body),
    // });
    // await Router.push("/drafts");
    console.log("submitData function");
  } catch (error) {
    console.error(error);
  }
};

const CreateStashForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const form = useForm({
    initialValues: {
      email: "",
      termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

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

          <NumberInput
            withAsterisk
            label="Number of Shelves"
            placeholder="6"
            {...form.getInputProps("temperature")}
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
