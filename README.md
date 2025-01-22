<div align="center">

# Hermes

##### Another application that claims to be... blazingly fast 🔥🔥

<img src="./docs/images/logo.png" alt="Logo" style="width:250px;">

<br/>
<br/>

![Static Badge](https://img.shields.io/badge/NestJS-grey?style=for-the-badge&logo=NestJS)
![Static Badge](https://img.shields.io/badge/JavaScript-grey?style=for-the-badge&logo=javascript)
![Static Badge](https://img.shields.io/badge/TypeScript-grey?style=for-the-badge&logo=typescript)
![Static Badge](https://img.shields.io/badge/Docker-grey?style=for-the-badge&logo=docker)
![Static Badge](https://img.shields.io/badge/Kubernetes-grey?style=for-the-badge&logo=kubernetes)
![Static Badge](https://img.shields.io/badge/Helm-grey?style=for-the-badge&logo=Helm)
![Static Badge](https://img.shields.io/badge/Redis-grey?style=for-the-badge&logo=Redis)
![Static Badge](https://img.shields.io/badge/RabbitMQ-grey?style=for-the-badge&logo=RabbitMQ)
![Static Badge](https://img.shields.io/badge/PostgresSQL-grey?style=for-the-badge&logo=PostgresSQL)
![Static Badge](https://img.shields.io/badge/OpenTelemetry-grey?style=for-the-badge&logo=OpenTelemetry)

</div>

## The Problem

Imagine you are an entry-level software engineer supporting the development of a new web client for an alarm system in your second year. It's only you and the lead developer. The lead developer decides to pursue another opportunity, and suddenly you find yourself promoted to the lead despite your inexperience. As you're exploring the solutoin, you start getting incident ticket after incident ticket reporting that alarm notifications aren't working, so you begin to investigate. Your realize that, with your focus on the frontend, you never noticed that the applicaiton had about 20 microservices in the backend, all communicating through RESTful APIs. (it has more microservices than frontend screens - deep breath 😰) You then begin to investigate how the microservices communicate, only to find nested calls within nested calls. Your nightmare truly begins.

## The Solution

Fast-foward 1.5 years, with a wealth of knowledge earned under the constant barrage of incident tickets that plagued the notification service and increased expectations as the lead developer. You set out to broaden and test your understanding of software architectures and explore concepts like message brokers and caching, which you haven't yet applied professionally. One project comes to mind - a notification service. Motivated by the knowledge your team plans to rewrite the notification service in the future, and the hope your project will eventually be forked and replace the notification service leveraged at work, you begin your work. This is that project.

### Requirements

1. Deliver notifications through a variety of methods (email, phone, text message, and web push notifications) and should support the addition of new types of notifications.
2. Ability to deliver multiple notifications based on subscriptions to a distribution event.
3. Application should be reliable (alarm notification's are critical 🚨) and try to deliver notification'sat least once.
4. Distributed telemetry is collected for improved insights into failure points.

### Architecture

<div align="center">
    <img src="./docs/images/architecture.png" alt="Hermes Architecture">
</div>

<br/>
<br/>

Hermes implements a microservices architecture to achieve it's requirements for reliablility and scalability. While this introduces maintains similar challenges to the original notification implementation, such as communication and tracebiility, it focuses the business domain into three services:

- Identity Access Management (IAM): Manages the creation of users and api keys, assignment of permissons, and validates generated access tokens and api keys before Hermes resources may be accessed.
- Distribution: A rules engine that accepts a distribution event, evaluates the associated data to see if there are any registered subscriptions interested in that event, and generates notification jobs.
- Notification: Responsible for compiling the notification template with the data and sending the notification.

### Performance Estimation

## Getting Started

### Installation

In the root directory, you need to install the dependencies.

```bash
$ npm install
```

### Running the Application(s) for Development

Before running one of the applications locally, you need to add a _application-name_.env file to the env directory (there are samples provided). Each file contains the configuration required to connect to infrastructure components (Postgres, RabbitMQ, Redis, etc.) as well as control over some of the application's behavior (retries, authentication, etc.).

```bash
# w/node
$ npm run start:[application-name]

# w/docker - recommended
$ docker compose up --build
```

### Build the Application(s)

To build the application(s) locally:

```bash
$ npm run build:[application-name]
```

To build the application(s) with Docker:

```bash
$ docker build -f docker/Dockerfile.prod ---build-arg APPLICATION=[application-name] --build-arg DEFAULT_PORT=[port-number] .
```

### Test Automation

```bash
# unit tests
$ npm run test

# end-to-end tests
$ npm run test:e2e
```

_Note: The end-to-end test automation **requires** [Docker](https://www.docker.com/get-started/) to be installed so that it can set-up a test database before execution._

#### Tips

1. When runing the unit tests, [watch mode](https://jestjs.io/docs/cli#--watch) enables Jest to monitor changes to file(s) and re-run tests related to changed files.
