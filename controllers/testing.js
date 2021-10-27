const test = {
  public: "This is public",
  secret: "This is secret",
  testFn,
};

function testFn(val) {
  const test2 = {
    public: "This is public",
    secret: "This is secret",
    testFn2,
  };

  function testFn2(val) {
    const test3 = {
      public: "This is public",
      secret: "This is secret",
      testFn3,
    };

    function testFn3(val) {
      console.log(val);
    }

    console.log(({ public } = test3));
    console.log(public);
  }

  testFn2(test2);
  console.log(public);
}

testFn(test);
console.log(public);
