# @version ^0.3.7
# @license MIT

# owner: address
# manager: address

@deploy
def __init__(_owner:address, _manager:address):

    self.owner = msg.sender
    self.owner = msg.sender

@internal
def onlyOwner(_owner: address):
    assert _owner == self.owner, "You are not authorized"

@internal
def onlyManager(_manager: address):
    assert _manager == self.manager, "You are not authorized to manage this contract"
