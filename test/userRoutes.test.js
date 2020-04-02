process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
let User = require("../models/users");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
let should = chai.should();

const usersUrl = "/users/";
const loginUrl = usersUrl + "login";

chai.use(chaiHttp);

describe("User routes", () => {
  before(done => {
    User.deleteMany({}, err => {
      done();
    });
  });

  //GET all users
  describe("GET all users", () => {
    it("should GET all users", done => {
      chai
        .request(server)
        .get(usersUrl)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  //Register user
  describe("POST/register one user", () => {
    it("should POST one user", done => {
      const user = {
        username: "TestUser",
        password: "pass",
        email: "test@gmail.com"
      };

      chai
        .request(server)
        .post(usersUrl) //http://localhost:3000/users
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an("object");
          res.body.should.have.property("username").eql("TestUser");
          res.body.should.have.property("email").eql("test@gmail.com");
          res.body.should.have.property("password").not.eql("pass");
          done();
        });
    });
  });

  //Get user by username
  describe("GET one user", () => {
    it("should GET one user by username", done => {
      const username = "TestUser";
      const url = usersUrl + username;
      chai
        .request(server)
        .get(url)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an("object");
          res.body.should.have.property("username").eql("TestUser");
          res.body.should.have.property("password");
          res.body.should.have.property("email").eql("test@gmail.com");
          done();
        });
    });
  });

  //Add room to user
  describe("CREATE room for user", () => {
    it("should PUT one room to user", done => {
      const username = "TestUser";
      const url = "/users/room/" + username;
      const newRoom = {
        name: "Test Room",
        deviceID: 42
      };
      chai
        .request(server)
        .put(url)
        .send(newRoom)
        .end((err, res) => {
          res.should.have.status(202);
          res.should.be.an("object");
          res.body.should.have.property("rooms");
          const rooms = res.body.rooms;
          rooms.length.should.eql(1);
          rooms[0].should.have.property("name").eql(newRoom.name);
          rooms[0].should.have.property("deviceID").eql(newRoom.deviceID);
          done();
        });
    });
  });

  describe("successful user login", () => {
    it("should return json web token", done => {
      const user = {
        username: "TestUser",
        password: "pass"
      };

      chai
        .request(server)
        .post(loginUrl)
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("token");
          res.body.token.should.be.a("string");
          done();
        });
    });
  });

  describe("failed user login - bad password", () => {
    it("should return 404 status and not log the user in", done => {
      const user = {
        username: "TestUser",
        password: "123"
      };

      chai
        .request(server)
        .post(loginUrl)
        .send(user)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.have.property("token");
          done();
        });
    });
  });

  describe("failed user login - bad request", () => {
    it("should return 500 status because of bad request body", done => {
      const user = {
        username: "TestUser"
      };
      const url = "/users/";
    });
  });
});
