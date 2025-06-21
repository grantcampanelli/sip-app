import {
  Group,
  Button,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  ActionIcon,
  Container,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "../styles/HeaderMenu.module.css";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { IconLogout } from "@tabler/icons-react";

const SignedIn = () => {
  const {data: session, status: loading} = useSession();

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  if(loading === 'loading') {
    return <></>;
  }

  if (session) {
    return (
      <>
        <Group h="100%" gap={0} visibleFrom="sm">
          <Link href="/bottles" className={classes.link}>
            My Bottles
          </Link>
          <Link href="/stashes" className={classes.link}>
            My Stashes
          </Link>
          <Link href="/brands" className={classes.link}>
            Brands
          </Link>
          <Link href="/account" className={classes.link}>
            Account
          </Link>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={() => signOut()}
            aria-label="Log out"
            ml="sm"
          >
            <IconLogout size={16} />
          </ActionIcon>
        </Group>

        <Burger 
          opened={drawerOpened} 
          onClick={toggleDrawer} 
          hiddenFrom="sm"
          size="sm"
        />

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

            <Link
              href="/bottles"
              className={classes.link}
              onClick={toggleDrawer}
            >
              My Bottles
            </Link>
            <Link
              href="/stashes"
              className={classes.link}
              onClick={toggleDrawer}
            >
              My Stashes
            </Link>
            <Link
                href="/brands"
                className={classes.link}
                onClick={toggleDrawer}
            >
              Brands
            </Link>
            <Link
                href="/account"
                className={classes.link}
                onClick={toggleDrawer}
            >
              Account
            </Link>
            
            <Divider my="sm" />
            
            <Button 
              fullWidth 
              variant="light" 
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={() => signOut()}
            >
              Log Out
            </Button>
          </ScrollArea>
        </Drawer>
      </>
    );
  } else {
    return (
      <Group>
        <Button 
          variant="filled"
          onClick={() => signIn()}
          size="sm"
        >
          Log in
        </Button>
      </Group>
    );
  }
};

const Header = () => {
  return (
    <Box className={classes.headerWrapper}>
      <header className={classes.header}>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            <Link href="/" className={classes.logo}>
              <Image
                src="/SipLogoNoBg.png"
                width={70}
                height={70}
                alt="Sippin Logo"
                priority
              />
            </Link>
            <SignedIn />
          </Group>
        </Container>
      </header>
    </Box>
  );
};

export default Header;
