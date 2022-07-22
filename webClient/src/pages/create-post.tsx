import { Box, Button, Heading } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import Router, { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../hooks';

const CreatePost: NextPage = () => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();
  useIsAuth();

  let sub: string | null = null;

  if (router.query.sub) {
    sub = router.query.sub as string;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: '', text: '', sub: sub || null }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: { text: values.text, title: values.title, subIdentifier: values.sub } },
            update: (cache) => {
              cache.evict({ fieldName: 'userPosts:{}' });
              sub && cache.evict({ fieldName: 'subPosts' });
            },
          });
          if (!errors) {
            Router.back();
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {sub && <Heading mb={4}>Posting to {sub}</Heading>}
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField textarea name="text" placeholder="text..." label="Body" />
            </Box>
            <Button mt={'3'} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;
