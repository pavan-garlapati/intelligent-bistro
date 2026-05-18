import cors from 'cors';

const isDevelopment = process.env.NODE_ENV === 'development';

const corsOptions = isDevelopment
  ? { origin: '*' }
  : { origin: false };

export default cors(corsOptions);
