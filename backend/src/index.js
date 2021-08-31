"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var fs_1 = require("fs");
function startApp(port) {
    return __awaiter(this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            app = express_1["default"]();
            app.use(express_1["default"].json());
            app.use(express_1["default"].urlencoded({ extended: true }));
            app.get("/api/posts", function (_, res) {
                res.send([
                    {
                        title: "Hello World",
                        url: "https://www.google.com",
                        votes: 10,
                        id: "abc123",
                        username: "JohnJ",
                        verifiedUser: true,
                        timestamp: "2021-08-12"
                    },
                    {
                        title: "Goodbye World",
                        url: "https://www.reddit.com/",
                        votes: 1,
                        id: "xyz123",
                        username: "steve",
                        verifiedUser: false,
                        timestamp: "2021-08-15"
                    },
                    {
                        title: "Hello World2",
                        votes: 100,
                        id: "abc1234",
                        username: "JohnJ",
                        verifiedUser: true,
                        timestamp: "2021-08-30"
                    },
                ]);
            });
            app.get("/api/posts/:id", function (_, res) {
                res.send({
                    title: "Hello World",
                    votes: 10,
                    id: "abc123",
                    username: "john",
                    timestamp: "2021-08-12",
                    body: "# Body",
                    comments: [
                        {
                            body: "A paragraph with *emphasis* and **strong importance**.",
                            username: "bob",
                            timestamp: "2021-08-12"
                        },
                        {
                            body: "Just a link: https://reactjs.com.",
                            username: "john",
                            timestamp: "2021-08-12"
                        },
                    ]
                });
            });
            app.get("/api/users/:name", function (_, res) {
                res.send({
                    name: "JohnJ",
                    verified: true,
                    description: "I am a user",
                    graduationSemester: "Fall 2020",
                    joined: "2021-08-12",
                    posts: [
                        {
                            title: "Hello World",
                            url: "https://www.google.com",
                            votes: 10,
                            id: "abc123",
                            username: "JohnJ",
                            verifiedUser: true,
                            timestamp: "2021-08-12"
                        },
                    ]
                });
            });
            app.post("/api/login", function (req, res) {
                var _a = req.body, username = _a.username, password = _a.password;
                if (username === "john" && password === "secret") {
                    fs_1["default"].readFile("./private.pem", function (err, privKey) {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Internal Server Error");
                        }
                        else {
                            var token = jsonwebtoken_1["default"].sign({ username: username }, privKey, { expiresIn: "30d" });
                            res.cookie("token", token, {
                                httpOnly: true,
                                sameSite: "strict",
                                secure: true,
                                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000)
                            });
                            res.send();
                        }
                    });
                }
                else {
                    res.status(401).send({
                        error: "invalid credentials"
                    });
                }
            });
            app.post("/api/logout", function (req, res) {
                res.clearCookie("token");
                res.send();
            });
            app.listen(port, function () {
                console.log("server is up on port: " + port);
            });
            return [2 /*return*/];
        });
    });
}
require("dotenv").config();
startApp(8800)["catch"](console.log);
