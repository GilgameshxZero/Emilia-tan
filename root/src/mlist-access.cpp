/*
Emilia-tan Script

This script either toggles an email on the mailing list or checks status of an email.
*/

#include "../rain/cpp/rain.hpp"

int main(int argc, char *argv[]) {
  const static std::string DATA_FILE = "..\\..\\data\\mlist-subs.ini";

  _setmode(_fileno(stdout), _O_BINARY);

  std::string response;
  std::map<std::string, std::string> query =
      Rain::getQueryToMap(std::getenv("QUERY_STRING"));

  std::string action = query["action"], email = query["email"];

  if (email == "") {
    response = "Email is empty";
  } else {
    std::vector<std::string> subs = Rain::readMultilineFile(DATA_FILE);
    std::set<std::string> subSet;

    subSet.insert(subs.begin(), subs.end());
    bool subscribed = subSet.find(email) != subSet.end();

    if (action == "check") {
      response = subscribed ? "Subscribed" : "Not subscribed";
    } else if (action == "toggle") {
      if (subscribed) {
        subSet.erase(email);
        response = "Unsubscribed";
      } else {
        subSet.insert(email);
        response = "Subscribed";
      }

      std::string newFileData = "";
      for (auto it = subSet.begin(); it != subSet.end(); it++) {
        newFileData += *it + Rain::LF;
      }
      Rain::printToFile(DATA_FILE, newFileData);
    }
  }

  std::cout << "HTTP/1.1 200 OK" << Rain::CRLF << "content-type:text/html"
            << Rain::CRLF << Rain::CRLF << response;

  return 0;
}
