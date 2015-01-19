FROM dockerfile/nodejs-bower-gulp

MAINTAINER christian@pekeler.org

RUN npm install http-server -g
RUN mkdir /datepicky.js
WORKDIR /datepicky.js
ADD . /datepicky.js
RUN npm install
RUN gulp
