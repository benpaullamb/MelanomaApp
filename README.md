# Melanoma AI

![status: completed](https://img.shields.io/badge/status-completed-success)

See _Dissertation.pdf_ for the full write-up.

## Built with

- TensorFlow.js
- React Native

## Abstract

The incidence rate of **melanoma skin cancer** is increasing faster than any other form of cancer
and there is no easy way, without going to a dermatologist, of knowing if you have it. An
individual has many dozens of moles on their body, with 1/3rd of those on your back which
may be difficult to see. Melanoma has very few symptoms other than a change in the skin
lesion’s appearance. Examples include being asymmetrical or changing over time. Without
expert knowledge it is still very difficult to catch. And as with all cancers, the earlier it is
diagnosed the better. Dermatologists are expensive for the NHS and have long waiting times
(including other issues).

To address these problems, the approach this project takes is a **convolutional neural network**,
trained on more than 1000 images of melanoma and benign moles each, which is used to
predict how likely a new image is to be melanoma or benign. An **Android application** has also
been developed which will embed this model, allowing users to pass their own images
through it. As the model is only trained on still shots of skin lesions, it does not take into
account it’s evolution (change over time) – one of the most important factors. Therefore, the
app also allows users to store images of moles, organise them into body parts, and view them
at a later date.

The final AI model produced an **accuracy of 67.6%**, which is far better than a 50/50 guess.
The main problem that this project faced was the lack of clinical images (taken without a
microscope) of moles. Dermoscopic images (taken with a microscope) thus had to be used
which, although it produced a reasonable accuracy, made it possibly ineffective when used
with the app and the phone’s camera.
