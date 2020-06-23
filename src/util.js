export const animate = (() => {
  let id;

  return (callback, timeout) => {
    if (id) {
      clearTimeout(id);
    }

    function loop() {
      id = setTimeout(loop, timeout);
      callback();
    }

    loop();
  };
})();

const getJSON = async (url) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const poll = (url, timeout, cb) => {
  const fn = async () => {
    const data = await getJSON(url);
    cb(data);
  };
  const id = setInterval(fn, timeout);
  fn();

  return () => clearInterval(id);
};
