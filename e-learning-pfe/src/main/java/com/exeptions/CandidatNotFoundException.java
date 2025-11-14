package com.exeptions;

public class CandidatNotFoundException extends RuntimeException {
    public CandidatNotFoundException(String message) {
        super(message);
    }
}
