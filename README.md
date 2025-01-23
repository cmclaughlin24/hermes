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

Imagine you are an entry-level software engineer supporting the development of a new web client for an alarm system in your second year. It's only you and the lead developer. The lead developer decides to pursue another opportunity, and suddenly you find yourself promoted to the lead despite your inexperience. As you're exploring the solution, you start getting incident ticket after incident ticket reporting that alarm notifications aren't working, so you begin to investigate. Your realize that, with your focus on the frontend, you never noticed that the application had about 20 microservices in the backend, all communicating through RESTful APIs. (it has more microservices than frontend screens - deep breath 😰) You then begin to investigate how the microservices communicate, only to find nested calls within nested calls. Your nightmare truly begins.

## The Solution

Fast-foward 1.5 years, with a wealth of knowledge earned under the constant barrage of incident tickets that plagued the notification service and increased expectations as the lead developer. You set out to broaden and test your understanding of software architectures and explore concepts like message brokers and caching, which you haven't yet applied professionally. One project comes to mind - a notification service. Motivated by the knowledge your team plans to rewrite the notification service in the future, and the hope your project will eventually be forked and replace the notification service leveraged at work, you begin your work. This is that project.

### Requirements

1. Deliver notifications through a variety of methods (email, phone, text message, and web push notifications) and should support the addition of new types of notifications.
2. Ability to deliver multiple notifications based on subscriptions to a distribution event.
3. Application should be reliable (alarm notification's are critical 🚨) and try to deliver notification'sat least once.
4. Clearly defined responsibilities and communication between services without becoming overly granular.
5. Distributed telemetry is collected for improved insights into failure points.

### Architecture

<div align="center">
    <img src="./docs/images/technical-architecture-diagram.png" alt="Hermes Technical Architecture Diagram">
</div>

<br/>
<br/>

Hermes implements a microservices architecture to achieve it's requirements for reliablility and scalability. While this introduces similar challenges to the original notification implementation, such as communication and tracebiility, it focuses the business domain into three services: _Identity Access Management (IAM), Distribution,_ and _Notification_.

#### Identity Access Management (IAM)

Manages the creation of users and api keys, assignment of permissons, and validates generated access tokens and api keys before Hermes resources may be accessed.

<div align="center">

###### Entity Relationship Diagram

<img src="./docs/images/iam-entity-relationship.png" alt="IAM Entity Relationship">

</div>

#### Distribution

A rules engine that accepts a distribution event, evaluates the associated data to see if there are any registered subscriptions interested in that event, and generates notification jobs.

<div align="center">

###### Entity Relationship Diagram

<img src="./docs/images/distribution-entity-relationship.png" alt="Distribution Entity Relationship">

</div>

#### Notification

Responsible for compiling the notification template with the data and sending the notification.

<div align="center">

###### Entity Relationship Diagram

<img src="./docs/images/notification-entity-relationshiop.png" alt="Notication Entity Relationship">

</div>

### Authentication & Authorization

### How is a notification sent?

<div align="center">
    <img src="./docs/images/architecture.png" alt="Hermes Architecture">
</div>

1.  The first step in the journey to create a notification, is the _client microservice_. This service defines one or more conditions for triggering a notification. Once the service identifies these conditions, it publishes a message to [RabbitMQ](https://www.rabbitmq.com/). For the distribution service to process this message successfully, it must adhere to the following format:

    ```javascript
        {
            "id": "",           // Universal Unique Identifier (UUID4) identifying the individual message
            "type": "",         // name of the distribution event that should be triggered
            "payload": {},
            "metadata": {},
            "timeZone": "",
            "recipients": [],
            "addedAt": ""
        }
    ```

2.  RabbitMQ, a reliable and feature-rich message and streaming broker, was selected for this project due to it's powerful routing capabilities. As an added bonus, it is easy to set-up and deploy on cloud environments or run locally. Upon receiving the messsage from the client microservice, RabbitMQ routes it to the appropriate queue for the distribution service.

3.  The _distribution service_ acts as a rules engine that identifies if there are any registered listeners interested in the message. Once the message enters the service, it first undergoes rehydrate and validation. If the message passes validation, processing continues; otherwise it will be marked as corrupted. Corrupted messages are logged to the _DistributionLog_ table of the database, and the message will **not** be retried.

4.  After validating the message, the distribution proceeds to identify and retreive the relevant distribution event. A _distribution event_ is predefined trigger with a set of _distribution rules_ that dictate how and when notifications should be sent to recipients. It is responsible for ensuring the right information is delivered to the correct recipients in the appropriate manner.

5.  The next step in the process is selecting the appropriate _distribution rules_ from those defined for an event. This selection determines the methods and conditions for dispatching a notificcation. Consider the following distribution event and associated rules:

    <div align="center">
        <img src="./docs/images/distribution-rule-example.png" alt="Distribution Rule Example" style="width:600px;">
    </div>

    <br/>

    The `order-confirmation` distribution event specifies certain message labels for evaluation, in this example the `languageCode` label. Two rules are defined for this event:

    - **Distribution Rule #1**: Does not contain any metadata - this is known as the **default distribution rule**. Each distribution event is required to have a default rule to ensure notification delivery when no specific rules match.
    - **Distribution Rule #2**: Contains metadata specifying `"languageCode": "es-MX"`.

    <br/>

    ```javascript
        {
            "id": "34e37416-87ed-496c-b55e-6189b7a383ef",
            "type": "order-confirmation",
            "payload": {},
            "metadata": {
                "languageCode": "es-MX",
            },
            "timeZone": "America/Chicago",
            "recipients": [],
            "addedAt": "2025-01-23T00:30:45.914Z"
        }
    ```

    A distribution rule is selected for a message if all evaluated labels match those in the message metadata. In the example above, Distribution Rule #2 would be selected because the `languageCode` label evaluates to `es-MX`, which matches the rule's condition. If a match was not found, the default distribution rule would've been applied.

    _Designer's Note: The metadata labels are inspired by Kubernete's [Labels & Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) that are used by a deployment to identify which pods it should control._

6.  Subscriptions Filtering- Coming soon

7.  Subscriptions Retreival and Evaluation - Coming soon

8.  Notifications Service - Coming soon

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

## References

- [RabbitMQ Exchange Types](https://www.cloudamqp.com/blog/part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html)
