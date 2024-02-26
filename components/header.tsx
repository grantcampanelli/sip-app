import {
  Group,
  Button,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "../styles/HeaderMenu.module.css";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const SignedIn = () => {
  const { data: session } = useSession();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();
  if (session) {
    return (
      <>
        <Group h="100%" gap={0} visibleFrom="sm">
          <a href="/bottles" className={classes.link}>
            Bottles
          </a>
          <a href="/stashes" className={classes.link}>
            Stashes
          </a>
          <Button onClick={() => signOut()}>Log Out</Button>
        </Group>

        <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />

        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          hiddenFrom="sm"
          zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
            <Divider my="sm" />
            <a href="/bottles" className={classes.link}>
              Bottles
            </a>
            <a href="/stashes" className={classes.link}>
              Stashes
            </a>

            <Divider my="sm" />
            <Button fullWidth onClick={() => signOut()}>
              Log Out
            </Button>
          </ScrollArea>
        </Drawer>
      </>
    );
  } else {
    return (
      <>
        <Group>
          <Button onClick={() => signIn()}>Log in</Button>
        </Group>
      </>
    );
  }
};

const Header = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();

  return (
    <Box pb={10}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%" pl="10px" pt="10px">
          <Link href="/">
            <Image
              src="/SipLogoNoBg.png"
              width={100}
              height={100}
              alt="Sip Logo"
            />
          </Link>

          <SignedIn />
        </Group>
      </header>
    </Box>
  );
};

export default Header;
