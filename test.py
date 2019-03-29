import sys

def main():
    all = ""
    for arg in sys.argv[1:]:
        all = all + str(arg)
    return all

if __name__ == "__main__":
    main()