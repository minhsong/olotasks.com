import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
const mongoose = require("mongoose");

@Schema({ collection: 'board', timestamps: true })
export class boardSchema {
    title: {
      type: String,
      required: true,
    },
    isImage: {
      type: Boolean,
      default: true,
    },
    backgroundImageLink: {
      type: String,
      required: true,
    },
    labels: [
      {
        text: {
          type: String,
        },
        color: {
          type: String,
        },
        backColor: {
          type: String,
        },
        selected: {
          type: Boolean,
        },
      },
    ],
    activity: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        name: {
          type: String,
        },
        action: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        edited: {
          type: Boolean,
          default: false,
        },
        cardTitle: {
          type: String,
          default: "",
        },
        actionType: {
          type: String,
          default: "action",
        },
        color: {
          type: String,
        },
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        name: {
          type: String,
        },
        surename: {
          type: String,
        },
        email: {
          type: String,
        },
        role: {
          type: String,
          default: "member",
        },
        color: {
          type: String,
        },
      },
    ],
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "list",
      },
    ],
    description: {
      type: String,
      default: "",
    },
  }

module.exports = mongoose.model("board", boardSchema);
