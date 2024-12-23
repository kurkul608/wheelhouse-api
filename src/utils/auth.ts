export const parseService = (token: string) => {
  const params = token.split("&");

  return params.reduce((acc, param) => {
    const keyValue = param.split("=");
    const key = decodeURIComponent(keyValue[0]);
    const value = decodeURIComponent(keyValue[1]);
    return { ...acc, [key]: value };
  }, {});
};

export const getIdByToken = (token: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return JSON.parse(parseService(token).user).id;
};
