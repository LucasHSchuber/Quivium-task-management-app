export const getBaseUrl = () => {
  let platform = window.api.getPlatform();
  console.log(platform);

  let url = "";
  if (platform === "darwin") {
    url = "";
  } else if (platform === "win32") {
    url = "";
  }

  return { platform, url };
};
