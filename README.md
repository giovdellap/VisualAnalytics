# VisualAnalytics
Project for the course of Visual Analytics A.A. 23/24
Student: Giovanni Della Pelle

## To run

1) Be sure to have docker installed and running
2) locate inside this folder and command "docker compose up"

## Scenario: 

### Generic description

Our company provides AI tools for finance brokers.
A customer, using our website, can use 4 tools to analyze market trends.
Each usage of a tool consists of a request about specific companies/market partitions, with user-specified parameters.

### Company systems

Each request is served by one of our in-house AI models. These models elaborate in-house stored data to provide a response to the user.
When some of the input datas are missing, a request to an external AI service is sent. In this case, the user request must wait until the missing data is received from the external service. 

## PROBLEM

We have received complaints about the quality of our services.
The complaints are about output quality and loading time.

### Output Quality problems

Output quality problems are:
- Low quality responses (low satisfaction)
- Customer has to re-generate various times to obtain a satisfactory response (high generations)
