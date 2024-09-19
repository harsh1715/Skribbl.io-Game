package com.example.webchatserver;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

/**
 * This is a class that has services
 * In our case, we are using this to generate a random fruit or vegetable**/
@WebServlet(name = "chat", value = "/chat")
public class Chat extends HttpServlet {
    private String message;

    // static so this list is shared across all instances of Chat
    public static List<String> fruitsAndVegetables = new ArrayList<>();

    /**
     * This method initializes the list of fruits and vegetables. You can modify this to include your own list.
     * **/
    @Override
    public void init() {
        String[] items = {
                "tree", "house", "flower", "sun", "moon", "star", "cloud", "bird", "dog", "cat",
                "car", "bicycle", "boat", "ship", "hot air balloon", "rocket", "teapot", "cup",
                "plate", "fork", "spoon", "knife", "chair", "table", "book", "pen", "pencil",
                "crayon", "marker", "paintbrush", "canvas", "basket", "ball", "guitar", "piano",
                "violin", "drums", "microphone", "headphones", "computer", "phone", "television",
                "lamp", "candle", "shoe", "hat", "bag", "umbrella", "glasses", "watch", "ring",
                "necklace", "bracelet", "earrings", "shirt", "pants", "skirt", "dress", "jacket",
                "sweater", "scarf", "gloves", "socks", "shorts", "swimsuit", "t-shirt", "hoodie",
                "coat", "backpack", "map", "compass", "binoculars", "flashlight", "knife", "rope",
                "tent", "campfire", "sleeping bag", "chair", "cooler", "water bottle", "camera",
                "sunglasses", "beach ball", "house", "kite", "baseball", "soccer ball", "football",
                "basketball", "volleyball", "tennis racket", "golf club", "pool cue", "dart board"
        };

        Random random = new Random();
        for (int i = 0; i < 50; i++) {
            int randomIndex = random.nextInt(items.length);
            fruitsAndVegetables.add(items[randomIndex]);
        }
    }

    /**
     * Method generates a random fruit or vegetable from the list
     **/
    public String getRandomFruitOrVegetable() {
        // create a new Random object to generate a random index in the fruitsAndVegetables list
        Random random = new Random();
        int randomIndex = random.nextInt(fruitsAndVegetables.size());
        return fruitsAndVegetables.get(randomIndex);
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/plain");

        // send the random fruit or vegetable as the response's content
        PrintWriter out = response.getWriter();
        out.println(getRandomFruitOrVegetable());
    }

    public void destroy() {
    }
}