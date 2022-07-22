import { useRouter } from 'next/router';
import { usePostQuery } from '../generated/graphql';

const useGetIdFromUrl = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  return id;
};
export default useGetIdFromUrl;
