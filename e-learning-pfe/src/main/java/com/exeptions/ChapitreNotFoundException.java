package com.exeptions;

public class ChapitreNotFoundException extends RuntimeException {
    public ChapitreNotFoundException(String message) {
        super(message);
    }
}
