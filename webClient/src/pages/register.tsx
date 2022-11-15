import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { MeDocument, MeQuery, useRegisterUserMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';

const Register: NextPage = () => {
  const router = useRouter();
  const [register] = useRegisterUserMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.registerUser.user,
                },
              });
            },
          });
          if (response.data?.registerUser.errors) {
            setErrors(toErrorMap(response.data.registerUser.errors));
          } else if (response.data?.registerUser.user) {
            router.replace('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" placeholder="username" label="Username" />
            <Box mt={4}>
              <InputField name="email" placeholder="email" label="Email" type="email" />
            </Box>
            <Box mt={4}>
              <InputField name="password" placeholder="password" label="Password" type="password" />
            </Box>
            <Button mt={4} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
