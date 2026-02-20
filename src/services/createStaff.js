import functions from '@react-native-firebase/functions';

export async function createStaff({ email, password, name, permissions = {} }) {

  const callable = functions().httpsCallable('createStaff'); 

  const result = await callable({
    email,
    password,
    name,
    permissions,
  });

  return result.data;
}