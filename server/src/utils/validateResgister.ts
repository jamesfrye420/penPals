import { UsernamePasswordInput } from '../resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'length must be greated than 2',
      },
    ];
  }
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'cannot contain @',
      },
    ];
  }
  // we could opt in for more advanced validation using the validator.js package
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }
  if (options.password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'length must be greated than 3',
      },
    ];
  }
  return null;
};
