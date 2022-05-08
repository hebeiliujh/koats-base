import development_env from './development';
import staging_env from './staging';

//根据不同的NODE_ENV，输出不同的配置对象，默认输出development的配置对象
const env = {
  development: development_env,
  staging: staging_env,
}[process.env.NODE_ENV || 'development'];

export default env;
