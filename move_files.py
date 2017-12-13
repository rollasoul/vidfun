import os


# if downloaded file is found rename and move to js folder
while True:
    if os.path.isfile("/Users/rolandarnoldt/Downloads/repl_left_nu.webm") is True:
        os.rename("/Users/rolandarnoldt/Downloads/repl_left_nu.webm", "/Users/rolandarnoldt/Documents/vidfun/repl_left_nu.webm")
        print("moved file left over")
        # write to text file in vidfun folder video name
        with open("/Users/rolandarnoldt/Documents/vidfun/move_vids.txt", 'w') as out:
            out.write("file left")
    if os.path.isfile("/Users/rolandarnoldt/Downloads/repl_right_nu.webm") is True:
        os.rename("/Users/rolandarnoldt/Downloads/repl_right_nu.webm", "/Users/rolandarnoldt/Documents/vidfun/repl_right_nu.webm")
        print("moved file right over")
        # write to text file in vidfun folder video name
        with open("/Users/rolandarnoldt/Documents/vidfun/move_vids.txt", 'w') as out:
            out.write("file right")
