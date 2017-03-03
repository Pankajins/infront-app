# README

Howdy, howdy devs!

infront is an application targeted towards blind people. By pronouncing the word 'CAPTURE' or clicking/tapping on the button, the device should take a picture. The image information is sent by Rails to Amazon Rekognition and rendered in React as a list of labels which is then read using the browser speech synthesis (or people can use a screen reader).

The application uses getUserMedia which is mostly supported by Chrome. At the moment there is no support for IOS.

To run this repo:

1. Clone repo
2. Run `bundle install`
3. Run `rails db:create`
4. Run `yarn install`
5. Run `yarn run rails-server`
