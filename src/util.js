export const animate = (callback, timeout) => {
  let id;

  function loop() {
    id = setTimeout(loop, timeout);
    callback();
  }

  loop();

  return () => clearTimeout(id);
};

export const poll = (url, timeout, cb) => {
  const fn = async () => {
    const blob = await fetch(url);
    const json = await blob.json();
    cb(json);
  };

  return animate(fn, timeout);
};
