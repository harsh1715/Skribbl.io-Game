package com.example.webchatserver;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.io.IOException;
import java.util.*;


/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users
    ChatServlet cs = new ChatServlet();
    // you may add other attributes as you see fit
    private static Map<String, String> usernames = new HashMap<String, String>();
    private static Map<String, String> roomList = new HashMap<String, String>();
    private static Map<String, ArrayList> RoomsList = new HashMap<String, ArrayList>();
    ArrayList<Session> roomUsers = new ArrayList<Session>();

    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {

        // Generate a unique 6-letter code for the roomID

        ArrayList<Session> roomUsers = RoomsList.getOrDefault(roomID, new ArrayList<>());
        roomUsers.add(session);
        RoomsList.put(roomID, roomUsers);


        roomList.put(session.getId(), roomID);

        System.out.println("Room joined ");

        String rooms = generateOutputString();
        String user = generateOutputStringUser(session, roomID);

        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Room " + roomID + "): Welcome to the chat room. Please state your username to begin.\"}");
        session.getBasicRemote().sendText("{\"type\": \"title\", \"message\":\"You are in room: " + roomID + "\"}");
        session.getBasicRemote().sendText("{\"type\": \"code\", \"message\":\"" + roomID + "\"}");

        session.getBasicRemote().sendText(rooms);
        session.getBasicRemote().sendText(user);


    }

    public String generateOutputStringUser(Session session, String roomID) {
        ArrayList<Session> roomUsers = RoomsList.getOrDefault(roomID, new ArrayList<>());

        StringBuilder output = new StringBuilder();

        List<String> users = new ArrayList<>();
        for (Session item : roomUsers) {


            users.add(usernames.get(item.getId()));
        }


        output.append("{\"type\": \"user\", \"message\": [");
        for (String user : users) {
            output.append("\"").append(user).append("\",");
        }
        if (output.charAt(output.length() - 1) == ',') {
            output.deleteCharAt(output.length() - 1);
        }
        output.append("]}");

        return output.toString();
    }

    public String generateOutputString() {
        StringBuilder output = new StringBuilder();
        Set<String> roomSet = new HashSet<>();

        // Create a list of unique rooms from roomList map
        List<String> rooms = new ArrayList<>();
        for (Map.Entry<String, String> entry : roomList.entrySet()) {
            String value = entry.getValue();
            if (!roomSet.contains(value)) {
                roomSet.add(value);
                rooms.add(value);
            }
        }

        // Output the list of rooms in JSON format
        output.append("{\"type\": \"rooms\", \"message\": [");
        for (String room : rooms) {
            output.append("\"").append(room).append("\",");
        }
        if (output.charAt(output.length() - 1) == ',') {
            output.deleteCharAt(output.length() - 1);
        }
        output.append("]}");

        return output.toString();
    }

    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();

        if (usernames.containsKey(userId)) {
            String username = usernames.get(userId);
            String roomID = roomList.get(userId);
            usernames.remove(userId);
            // remove this user from the roomList
            roomList.remove(roomID);

            // broadcasting it to peers in the same room
            int countPeers = 0;
            for (Session peer : session.getOpenSessions()) { //broadcast this person left the server
                if (roomList.get(peer.getId()).equals(roomID)) { // broadcast only to those in the same room
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room.\"}");
                    countPeers++; // count how many peers are left in the room
                }
            }
        }
    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {


//        example getting unique userID that sent this message
        String userID = session.getId();
        String roomID = roomList.get(userID); // my room
        JSONObject jsonmsg = new JSONObject(comm);
        String message =  jsonmsg.get("msg").toString();
        String type = jsonmsg.get("type").toString();

        if (type.equals("background")) {
            for (Session peer : session.getOpenSessions()) {
                // only send my messages to those in the same room
                if (roomList.get(peer.getId()).equals(roomID)) {
                    peer.getBasicRemote().sendText("{\"type\": \"" + type + "\", \"msg\": " + message + "}");
                    System.out.println(message);
                }
            }
        }

        else if (type.equals("canvas")) {
            for (Session peer : session.getOpenSessions()) {
                // only send my messages to those in the same room
                if (roomList.get(peer.getId()).equals(roomID)) {
                    peer.getBasicRemote().sendText("{\"type\": \"" + type + "\", \"msg\": " + message + "}");
                    System.out.println(message);
                }
            }
        }
////        Example conversion of json messages from the client
//        //        JSONObject jsonmsg = new JSONObject(comm);
////        String val1 = (String) jsonmsg.get("attribute1");
////        String val2 = (String) jsonmsg.get("attribute2");
//

        else {
            String user = generateOutputStringUser(session, roomID);
            session.getBasicRemote().sendText(user);
            // handle the messages
            if (usernames.containsKey(userID)) { // not their first message
                String username = usernames.get(userID);
                System.out.println(username);

                // broadcasting it to peers in the same room
                for (Session peer : session.getOpenSessions()) {
                    // only send my messages to those in the same room
                    if (roomList.get(peer.getId()).equals(roomID)) {
                        peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + "): " + message + "\"}");
                    }
                }
            } else { //first message is their username
                usernames.put(userID, message);
                session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Room " + roomID + "): Welcome, " + message + "!\"}");


                // broadcasting it to peers in the same room
                for (Session peer : session.getOpenSessions()) {
                    // only announce to those in the same room as me, excluding myself
                    if ((!peer.getId().equals(userID)) && (roomList.get(peer.getId()).equals(roomID))) {
                        peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + message + " joined the chat room.\"}");
                    }
                }
            }
        }

    }



}