import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useRegisterSubMutation } from '../generated/graphql';
import { useIsAuth } from '../hooks';
import { toErrorMap } from '../utils/toErrorMap';

const CreateSub: NextPage = () => {
  const router = useRouter();
  const [createSub] = useRegisterSubMutation();
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ name: '', subIdentifier: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createSub({
            variables: { options: values },
            update: (cache) => {
              cache.evict({ fieldName: 'userSubs' });
            },
          });

          if (response.data?.registerSub.errors) {
            setErrors(toErrorMap(response.data.registerSub.errors));
          } else if (response.data?.registerSub.sub) {
            // worked
            router.replace(`/`);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="name" placeholder="Name Of the Sub" label="Name" />
            <Box mt={4}>
              <InputField name="subIdentifier" placeholder="alias use to identify your sub" label="subIdentifier" />
            </Box>
            <Button mt={'3'} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Create Sub
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreateSub;
