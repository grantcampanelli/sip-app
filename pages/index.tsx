// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import { Image, Text, Card, Center, Loader, Box, Title, Stack} from "@mantine/core";
import { IconGlassFull, IconFridge, IconBottle } from '@tabler/icons-react';
import { Container, Grid } from "@mantine/core";

export default function Page() {

  const {data: session, status: loading} = useSession();
  // const {sessionContext : sessionContext} = useSession();
  // const [ session , loading ] = useSession();

  if(loading === 'loading') {
    return (
      <Center h="50vh">
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  if (session) {
    return (
      <Box py="xl">
        <Container size="lg">
          <Stack gap="xl">
            <Box ta="center" mb="lg">
              <Title order={2} c="gray.7" mb="xs">
                Welcome to Sippin
              </Title>
              <Text size="lg" c="gray.6">
                Manage your collection with ease
              </Text>
            </Box>
            
            <Grid gutter="lg">
              <Grid.Col span={{base: 12, sm: 6, md: 4}}>
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="lg"
                  component="a"
                  href="/bottles"
                  withBorder
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      }
                    }
                  }}
                >
                  <Card.Section pb="md">
                    <Center>
                      <IconBottle color="#e03131" stroke={1.5} size={80}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                      size="lg"
                      fw={600}
                      ta="center"
                      c="gray.8"
                    >
                      Browse Your Bottles
                    </Text>
                    <Text
                      size="sm"
                      ta="center"
                      c="gray.6"
                      mt="xs"
                    >
                      View and manage your collection
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{base: 12, sm: 6, md: 4}}>
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="lg"
                  component="a"
                  href="/stashes"
                  withBorder
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      }
                    }
                  }}
                >
                  <Card.Section pb="md">
                    <Center>
                      <IconFridge color="#1971c2" stroke={1.5} size={80}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                      size="lg"
                      fw={600}
                      ta="center"
                      c="gray.8"
                    >
                      Browse Your Stashes
                    </Text>
                    <Text
                      size="sm"
                      ta="center"
                      c="gray.6"
                      mt="xs"
                    >
                      Organize by location
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>

              <Grid.Col span={{base: 12, sm: 6, md: 4}}>
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="lg"
                  component="a"
                  href="/brands"
                  withBorder
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      }
                    }
                  }}
                >
                  <Card.Section pb="md">
                    <Center>
                      <IconGlassFull color="#2f9e44" stroke={1.5} size={80}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                      size="lg"
                      fw={600}
                      ta="center"
                      c="gray.8"
                    >
                      Browse All Brands
                    </Text>
                    <Text
                      size="sm"
                      ta="center"
                      c="gray.6"
                      mt="xs"
                    >
                      Explore brand catalog
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>
    );
  } else {
    return (
      <Box py="xl">
        <Container size="md">
          <Center h="50vh">
            <Stack gap="xl" ta="center">
              <Box>
                <Title order={1} c="gray.8" mb="md">
                  Know what you are sippin!
                </Title>
                <Text size="xl" c="gray.6" mb="lg">
                  Login to start tracking your bottles
                </Text>
              </Box>
              
              <Box>
                <Text size="md" c="gray.5">
                  Track your collection • Organize by location • Discover new brands
                </Text>
              </Box>
            </Stack>
          </Center>
        </Container>
      </Box>
    );
  }
}
